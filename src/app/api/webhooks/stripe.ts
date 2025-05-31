// app/api/create-subscription/route.ts
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

// Define a type for line items
interface LineItem {
  price: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const requestBody = await request.json();
    console.log('[DEBUG] Raw request body:', JSON.stringify(requestBody, null, 2));

    const { line_items, customer_email, metadata } = requestBody;

    // Validate required fields
    if (!line_items || !customer_email) {
      const missingFields = [];
      if (!line_items) missingFields.push('line_items');
      if (!customer_email) missingFields.push('customer_email');
      
      console.error('[ERROR] Missing required fields:', missingFields.join(', '));
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse and process user data
    let userData;
    try {
      userData = typeof metadata?.user_data === 'string' 
        ? JSON.parse(metadata.user_data) 
        : metadata?.user_data || {};
      
      console.log('[DEBUG] Parsed userData:', JSON.stringify(userData, null, 2));
    } catch (parseError) {
      console.error('[ERROR] Failed to parse user_data:', parseError);
      return NextResponse.json(
        { error: "Invalid user data format" },
        { status: 400 }
      );
    }

    // Normalize field names and set defaults
    const processedUserData = {
      email: customer_email,
      name: userData.name || userData.Name || "",
      phone: userData.phone || userData.Phone || "",
      password: userData.password || userData.Password || "",
      user_type: userData.user_type || userData.userType || "UNSELECTED",
      number_of_artist: Number(userData.number_of_artist || userData.number_of_artists || 0)
    };

    console.log('[DEBUG] Processed userData:', JSON.stringify({
      ...processedUserData,
      password: processedUserData.password ? '***REDACTED***' : 'empty'
    }, null, 2));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items.map((item: LineItem) => ({
        price: item.price,
        quantity: item.quantity
      })),
      mode: "subscription",
      success_url: `${request.headers.get("origin")}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/sign-up`,
      customer_email: customer_email,
      // Note: receipt_email was removed in favor of customer_email
      invoice_creation: {
        enabled: true,
      },
      metadata: {
        user_data: JSON.stringify(processedUserData),
        debug_timestamp: new Date().toISOString()
      },
      expand: ['customer', 'subscription'] // Get full objects for debugging
    });

    console.log('[DEBUG] Stripe session created:', {
      id: session.id,
      customer: session.customer,
      subscription: session.subscription,
      metadata: session.metadata
    });

    return NextResponse.json({ 
      sessionId: session.id,
      debug: {
        metadata_sent: session.metadata,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    const typedError = error as Error & { raw?: unknown };
    console.error('[ERROR] Create subscription failed:', {
      message: typedError.message,
      stack: typedError.stack,
      ...(typeof typedError.raw === "object" && typedError.raw !== null ? { stripe_error: typedError.raw } : {})
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create subscription",
        details: typedError.message
      },
      { status: 500 }
    );
  }
}