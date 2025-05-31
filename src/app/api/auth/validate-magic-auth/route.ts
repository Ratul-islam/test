// src/app/api/auth/validate-magic-auth/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Await the cookie store if cookies() returns a Promise
    const cookieStore = await cookies();
    const email = cookieStore.get('magic_link_email')?.value;
    const auth = cookieStore.get('magic_link_auth')?.value;

    if (!email || !auth || auth !== 'true') {
      return NextResponse.json({ error: "Invalid or expired magic link" }, { status: 401 });
    }

    // Clear cookies to prevent replay attacks
    cookieStore.delete('magic_link_email');
    cookieStore.delete('magic_link_auth');

    return NextResponse.json({ email });

  } catch (error) {
    console.error("Validate magic auth error:", error);
    return NextResponse.json({ error: "Authentication error" }, { status: 500 });
  }
}
