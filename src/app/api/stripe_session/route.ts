import { NextResponse } from "next/server";
import Stripe from "stripe";

// Avoiding build issue to be changed
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export async function POST(req: Request) {
  try {
    const { depositPaid, email, adminId, leadId, paymentType, success_url, cancel_url, currency, name } = await req.json();




    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url,
      cancel_url,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name,
            },
            unit_amount: Math.round(depositPaid * 100), // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        leadId,
        depositPaid,
        paymentType,
        adminId
      }
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error :unknown) {
    console.log("🚀 ~ POST ~ error:", error)
    return NextResponse.json({ error: "Error creating Stripe session" }, { status: 500 });
  }
}
