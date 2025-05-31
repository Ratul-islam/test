// File: /app/api/subscription/cancel-subscription/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const POST = async (req: NextRequest) => {
  try {
    const { email, reason, reason_for_cancel } = await req.json();

    if (!email || !reason || !reason_for_cancel)
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });

    const user = await prisma.admin.findUnique({
      where: {
        email
      }
    });
    if (!user)
      return NextResponse.json(
        { message: "User  doesn't exist" },
        { status: 400 }
      );

    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 14); // Set expiry date to 14 days from now

    // Updating DB
    const updateUser  = await prisma.admin.update({
      where: {
        email
      },
      data: {
        subscriptionExpiry: expiryDate,
        subscriptionStatus: "CANCELATIONINPROGRESS",
      }
    });

    return NextResponse.json({
      message: "Subscription Canceled!",
      updateUser ,
      success: true
    });
  } catch (error) {
    console.log("🚀 ~ Cancel Subscription ~ error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error processing cancellation." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while processing cancellation." },
      { status: 500 }
    );
  }
};