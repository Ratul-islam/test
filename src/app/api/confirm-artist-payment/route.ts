// /api/confirm-artist-payment/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/app/utils/prismadb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ message: 'Missing session ID' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session?.metadata?.studio_email || !session?.metadata?.number_of_artists) {
      return NextResponse.json({ message: 'Invalid session metadata' }, { status: 400 });
    }

    const email = session.metadata.studio_email;
    const numArtistsToAdd = parseInt(session.metadata.number_of_artists || '0');

    const studio = await prisma.admin.findUnique({
      where: { email },
    });

    if (!studio) {
      return NextResponse.json({ message: 'Studio not found' }, { status: 404 });
    }

    await prisma.admin.update({
      where: { email },
      data: {
        artistsNum: studio.artistsNum + numArtistsToAdd,
      },
    });

    return NextResponse.json({ message: 'Artists updated successfully' });
  } catch (error) {
    console.error('Error confirming artist payment:', error);
    return NextResponse.json({ message: 'Failed to confirm payment' }, { status: 500 });
  }
}
