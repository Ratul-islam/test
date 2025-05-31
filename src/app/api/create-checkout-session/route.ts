// app/api/create-checkout-session/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
});

export async function POST(request: Request) {
  try {
    const { line_items, customer_email, success_url, cancel_url, metadata } = await request.json();

    // Validate line items
    if (!Array.isArray(line_items) || line_items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid line items' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items.map(item => ({
        price: item.price,
        quantity: item.quantity,
      })),
      mode: 'subscription',
      customer_email,
      success_url: `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancel_url}?cancelled=true`,
      metadata,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error('Stripe error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}