// app/api/subscription/request-cancellation/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const POST = async (req: NextRequest) => {
  try {
    const { userId, reason } = await req.json();

    if (!userId || !reason) {
      return NextResponse.json(
        { message: "User ID and reason are required" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.admin.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "PENDING",
        cancellationReason: reason,
        cancellationRequestDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cancellation request submitted for admin review",
      data: updatedUser
    });

  } catch (error) {
    console.error("Error requesting cancellation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process cancellation request" },
      { status: 500 }
    );
  }
};