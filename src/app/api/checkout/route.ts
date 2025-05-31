import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

/**
 * Set this value to true for development (inline price).
 * Set to false for production (using Stripe Dashboard price IDs).
 */
const IS_DEVELOPMENT = true; // Toggle this for dev/prod

export async function POST(req: Request) {
  try {
    const {
      depositPaid,
      email,
      adminId,
      leadId,
      paymentType,
      success_url,
      cancel_url,
      checked,
    } = await req.json();

    // 1. Find or create customer by email
    const checkCustomer = await stripe.customers.list({ email });
    let customerId;
    if (checkCustomer.data.length > 0) {
      customerId = checkCustomer.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email });
      customerId = newCustomer.id;
    }

    // 2. Choose currency. Keep this consistent with existing customer subscriptions!
    const currency = "gbp"; // Change to 'usd' if all your Stripe prices are in USD

    // 3. Prepare line items for Stripe Checkout
    type LineItem = {
      price_data?: {
        currency: string;
        product_data: {
          name: string;
        };
        unit_amount: number;
        recurring?: {
          interval: "day" | "week" | "month" | "year"; // Use string literal type here
        };
      };
      price?: string;
      quantity: number;
    };
    let line_items: LineItem[] = [];
    const mode: "subscription" | "payment" = checked ? "subscription" : "payment";

    if (IS_DEVELOPMENT) {
      // ---------- DEVELOPMENT MODE (No Stripe Dashboard price required) ----------
      // Uses inline price_data for dev/testing.
      line_items = [
        {
          price_data: {
            currency,
            product_data: {
              name: "Monthly Subscription",
            },
            unit_amount: 5000, // £50.00 or $50.00 (in lowest currency unit)
            ...(checked
              ? { recurring: { interval: "month" } } // "month" is now a valid literal
              : {}),
          },
          quantity: 1,
        },
      ];
      // In dev, you do NOT need to set PRICE_ID_AUTO_RENEWAL or PRICE_ID_ONE_TIME in your .env
    } else {
      // ---------- PRODUCTION MODE (Requires Stripe Dashboard prices) ----------
      // 1. Set these in your .env (no spaces!):
      //    PRICE_ID_AUTO_RENEWAL=price_XXXXXX
      //    PRICE_ID_ONE_TIME=price_YYYYYY
      // 2. Get real price IDs from Stripe Dashboard > Products
      if (!process.env.PRICE_ID_AUTO_RENEWAL || !process.env.PRICE_ID_ONE_TIME) {
        return NextResponse.json(
          { error: "Price configuration missing. Please contact support." },
          { status: 400 }
        );
      }

      const priceId = checked
        ? process.env.PRICE_ID_AUTO_RENEWAL
        : process.env.PRICE_ID_ONE_TIME;

      line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
      // Make sure your Stripe prices are in the SAME currency as previous subscriptions for this customer!
    }

    // 4. Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode,
      success_url,
      cancel_url,
      customer: customerId,
      line_items,
      metadata: {
        leadId,
        depositPaid,
        paymentType,
        adminId,
        checked: checked ? "true" : "false",
        customerId,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error creating Stripe session" },
      { status: 500 }
    );
  }
}