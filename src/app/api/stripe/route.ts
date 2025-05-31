/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Avoiding build issue to be changed
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body
  },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.priceId) {
      return NextResponse.json(
        { error: 'Missing priceId' },
        { status: 400 }
      );
    }

    // Verify the price exists
    try {
      await stripe.prices.retrieve(body.priceId);
    } catch (_err) {
      console.error('Stripe error:', _err);
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: body.priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      customer_email: body.customerEmail,
      success_url: body.success_url || `${request.headers.get('origin')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.cancel_url || `${request.headers.get('origin')}/canceled`,
      metadata: body.metadata || {}
    });

    return NextResponse.json({ sessionId: session.id });

  } catch (err: any) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { 
        error: 'Failed to create subscription',
        details: err.message 
      },
      { status: 500 }
    );
  }
}

