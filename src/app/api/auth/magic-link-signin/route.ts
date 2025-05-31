// src/app/api/auth/magic-link-signin/route.ts

import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";


export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    // Use credential provider with magicLink parameter
    const result = await signIn("credentials", {
      email,
      magicLink: "true",
      redirect: false,
    });
    
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Magic link sign-in failed:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}