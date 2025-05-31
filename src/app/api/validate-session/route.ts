import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  console.log(sessionId);

  if (!sessionId) {
    return NextResponse.json(
      { error: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Validate the session
    if (session.payment_status === "paid") {
      return NextResponse.json({ valid: true, session });
    } else {
      return NextResponse.json(
        { valid: false, error: "Payment not completed" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
