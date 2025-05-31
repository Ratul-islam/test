/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/app/utils/prismadb";
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    if (req.method !== "POST") {
      return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
    }

    const reqBody = await req.json();
    const { email, password, name, phone, user_type, number_of_artist } = reqBody;
    
    if (!email || !password || !name || !phone || !user_type) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const existingUser = await prisma.admin.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 14); // 14-day trial
    
    // Generate verification token
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const newUser = await prisma.admin.create({
      data: {
        email,
        phone,
        name,
        hashedPassword,
        userType: user_type,
        artistsNum: user_type === "STUDIO" ? parseInt(number_of_artist) || 0 : 0,
        subscriptionExpiry: expiryDate,
        verificationToken,
        verificationTokenExpiry,
        emailVerified: null, // Not verified yet
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        email,
        name,
        token: verificationToken
      });
      console.log("Verification email sent successfully to:", email);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      // Continue even if email fails - user can request resend
    }

    return NextResponse.json({ 
      ...newUser, 
      requiresVerification: true 
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: error.message || "Error creating user" },
      { status: 500 }
    );
  }
}