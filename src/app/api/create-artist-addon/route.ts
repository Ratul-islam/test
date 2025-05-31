import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/utils/prismadb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { quantity, success_url, cancel_url } = await req.json();
    const numArtists = Math.max(1, Number(quantity)) || 1;

    const studio = await prisma.admin.findUnique({
      where: { email: session.user.email },
      select: { stripeCustomerId: true, artistsNum: true } // Fetch current artistsNum
    });

    if (!studio) {
      return NextResponse.json(
        { message: 'Studio not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: "price_1RAhMhLaglMDfP0HKpIkaxbH", // Ensure this is a subscription price
        quantity: numArtists
      }],
      mode: 'subscription', // Use 'payment' for one-time purchases
      success_url: `${success_url}?artist_addon_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancel_url}?cancelled=true`,
      customer: studio.stripeCustomerId || undefined,
      metadata: {
        type: 'artist_addon',
        studio_email: session.user.email,
        number_of_artists: numArtists.toString()
      }
    });

    // Update the artistsNum in the database immediately after creating the session
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedStudio = await prisma.admin.update({
      where: { email:session.user.email },
      data: {
        artistsNum: { increment: numArtists }, // Increment the current number of artists
      },
    });


    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}