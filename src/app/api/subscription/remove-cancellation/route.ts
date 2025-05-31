// File: /app/api/subscription/remove-cancellation/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const POST = async (req: NextRequest) => {
  try {
    const { email } = await req.json();

    if (!email)
      return NextResponse.json({ message: "Missing email" }, { status: 400 });

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

    // Resetting subscription status and expiry date
    const updateUser  = await prisma.admin.update({
      where: {
        email
      },
      data: {
        subscriptionStatus: "ACTIVE", // Reset to active or whatever the default is
      }
    });

    return NextResponse.json({
      message: "Cancellation request removed!",
      updateUser ,
      success: true
    });
  } catch (error) {
    console.log("🚀 ~ Remove Cancellation Request ~ error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error processing removal." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while processing removal." },
      { status: 500 }
    );
  }
};