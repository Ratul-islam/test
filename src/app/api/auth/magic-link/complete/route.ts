import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/utils/prismadb";
import { sendMagicLinkEmail } from "@/lib/email";

// Simple rate limiter to prevent abuse
const rateLimitMap = new Map<string, { count: number; firstRequestTs: number }>();
const MAX_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };

    // 1. Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 2. Apply rate limiting
    const now = Date.now();
    const entry = rateLimitMap.get(email) || { count: 0, firstRequestTs: now };
    if (now - entry.firstRequestTs < 60 * 60 * 1000) {
      if (entry.count >= MAX_PER_HOUR) {
        return NextResponse.json(
          { error: "Too many magic link requests. Please try again later." },
          { status: 429 }
        );
      }
      entry.count += 1;
    } else {
      // Reset window
      entry.count = 1;
      entry.firstRequestTs = now;
    }
    rateLimitMap.set(email, entry);

    // 3. Check if user exists
    const user = await prisma.admin.findUnique({ where: { email } });
    const isNewUser = !user;

    // 4. Generate a secure token
    const token = uuidv4();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5a. Delete any existing tokens for this identifier
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });

    // 5b. Create a brand new token record
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // 6. Send magic link email
    await sendMagicLinkEmail({
      email,
      token,
      isNewUser,
      name: user?.name || email.split('@')[0],
    });

    return NextResponse.json(
      { success: true, message: "Magic link sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
