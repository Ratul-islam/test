import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import prisma from "@/app/utils/prismadb";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.admin.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ 
        message: "Email already verified",
        verified: true 
      });
    }

    // Generate new verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    await prisma.admin.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpiry,
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email,
        name: user.name || '',
        token: verificationToken
      });
      
      return NextResponse.json({ 
        message: "Verification email resent successfully"
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error resending verification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}