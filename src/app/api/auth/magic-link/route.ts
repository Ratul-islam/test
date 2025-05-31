// src/app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import prisma from "@/app/utils/prismadb";
import { sendMagicLinkEmail } from "@/lib/email";

// Simple rate limiting
const rateLimitMap = new Map<string, { count: number; firstRequestTs: number }>();
const MAX_PER_HOUR = 5;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json() as { email?: string };

    // 1. Validate request
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 2. Rate limiting (per-email, 1 hour window)
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
    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ message: "Magic link sent if email exists" }, { status: 200 });
    }

    // 4. Generate a token
    const token = uuidv4();
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // 5. Save token to database
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    });

    // 6. Send magic link email
    await sendMagicLinkEmail({
      email,
      name: user.name || "",
      token
    });

    return NextResponse.json({ message: "Magic link sent" }, { status: 200 });

  } catch (err: unknown) {
    console.error("Magic link generation failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}