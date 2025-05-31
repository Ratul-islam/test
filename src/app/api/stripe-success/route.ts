/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import prisma from "@/app/utils/prismadb";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  console.log('[DEBUG] Stripe-Success: Request received');
  
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const debugMode = searchParams.get("debug");

  // Debug initial parameters
  console.log('[DEBUG] Stripe-Success: Initial parameters:', {
    sessionId,
    debugMode,
    searchParams: Object.fromEntries(searchParams.entries())
  });

  if (!sessionId) {
    console.error('[ERROR] Stripe-Success: Missing session_id parameter');
    return NextResponse.redirect(new URL("/payment-error?error=no_session_id", request.url));
  }

  try {
    console.log('[DEBUG] Stripe-Success: Retrieving session from Stripe...');
    
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer", "subscription"]
    });

    console.log('[DEBUG] Stripe-Success: Session retrieved:', {
      id: session.id,
      payment_status: session.payment_status,
      customer_email: session.customer_email,
      metadata_keys: session.metadata ? Object.keys(session.metadata) : 'none',
      created: new Date(session.created * 1000).toISOString()
    });

    if (session.payment_status !== "paid") {
      console.error('[ERROR] Stripe-Success: Payment not completed:', {
        payment_status: session.payment_status,
        session_status: session.status
      });
      return NextResponse.redirect(new URL("/payment-error?error=payment_not_completed", request.url));
    }

    if (!session.metadata?.user_data) {
      console.error('[ERROR] Stripe-Success: Missing user_data in metadata:', {
        metadata_contents: session.metadata
      });
      return NextResponse.redirect(new URL("/payment-error?error=invalid_metadata", request.url));
    }

    console.log('[DEBUG] Stripe-Success: Raw user_data:', session.metadata.user_data);

    let userData;
    try {
      userData = JSON.parse(session.metadata.user_data);
      console.log('[DEBUG] Stripe-Success: Parsed userData:', JSON.stringify({
        ...userData,
        password: userData.password ? '***REDACTED***' : 'empty'
      }, null, 2));
    } catch (e) {
      console.error('[ERROR] Stripe-Success: Failed to parse user_data:', {
        error: e,
        raw_data: session.metadata.user_data
      });
      return NextResponse.redirect(new URL("/payment-error?error=invalid_user_data", request.url));
    }

    if (!userData.email) {
      console.error('[ERROR] Stripe-Success: Email missing from user_data:', {
        user_data_contents: Object.keys(userData)
      });
      return NextResponse.redirect(new URL("/payment-error?error=email_required", request.url));
    }

    const { 
      email,
      name = "",
      phone = "",
      password = "",
      user_type = "UNSELECTED",
      number_of_artist = 0
    } = userData;

    console.log('[DEBUG] Stripe-Success: Preparing database operations for:', email);

    const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const userDataToUpdate = {
      name,
      email,
      phone,
      userType: user_type.toUpperCase() as 'ARTIST' | 'STUDIO' | 'UNSELECTED',
      artistsNum: typeof number_of_artist === 'string' ? parseInt(number_of_artist) || 0 : number_of_artist,
      subscriptionStatus: "ACTIVE" as const,
      subscriptionExpiry: new Date(new Date().setDate(new Date().getDate() + 30)),
      trial: false,
      autoRenew: true,
      depositPercentage: 15.0,
      emailVerified: null, // Initially not verified
      verificationToken,
      verificationTokenExpiry,
      ...(hashedPassword && { hashedPassword })
    };

    console.log('[DEBUG] Stripe-Success: User data to update:', JSON.stringify({
      ...userDataToUpdate,
      hashedPassword: userDataToUpdate.hashedPassword ? '***REDACTED***' : 'empty'
    }, null, 2));

    // Check for existing user
    const existingUser = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('[DEBUG] Stripe-Success: Updating existing user:', existingUser.id);
      await prisma.admin.update({
        where: { email },
        data: {
          ...userDataToUpdate,
          // Preserve existing password if not provided in update
          ...(!password && { hashedPassword: existingUser.hashedPassword }),
          // Keep existing provider info if not provided
          ...(!userData.provider && {
            provider: existingUser.provider,
            providerAccountId: existingUser.providerAccountId
          })
        }
      });
    } else {
      console.log('[DEBUG] Stripe-Success: Creating new user');
      await prisma.admin.create({
        data: {
          ...userDataToUpdate,
          provider: "credentials",
          providerAccountId: email,
          accounts: { create: [] },
          sessions: { create: [] }
        }
      });
    }

    // Send verification email
    try {
      await sendVerificationEmail({
        email: userData.email,
        name: userData.name || '',
        token: verificationToken
      });
      console.log('[DEBUG] Stripe-Success: Verification email sent successfully');
    } catch (emailError) {
      console.error('[ERROR] Stripe-Success: Failed to send verification email:', emailError);
      // Continue even if email fails - user can request a new one later
    }

    // Redirect to verification notice page with email in URL
    const response = NextResponse.redirect(
      new URL(`/verify-email?email=${encodeURIComponent(userData.email)}`, request.url)
    );
  
    // Set cookies with proper attributes
    response.cookies.set({
      name: 'pending_verification_email',
      value: userData.email, // Store raw email without encoding
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10 // 10 minutes
    });
    
    if (password) {
      response.cookies.set({
        name: 'pending_verification_password',
        value: password,
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10 // 10 minutes
      });
    }
  
    return response;
  
  }catch (error: any) {
    console.error('[ERROR] Stripe-Success:', {
      message: error.message,
      stack: error.stack,
      ...(error.raw && { raw_error: error.raw })
    });
    
    return NextResponse.redirect(
      new URL(`/payment-error?error=${encodeURIComponent(error.message || 'processing_failed')}`, request.url),
      { status: 302 }
    );
  }
}