// app/api/subscription/approve-cancellation/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const POST = async (req: NextRequest) => {
  try {
    const { adminId } = await req.json();

    if (!adminId) {
      return NextResponse.json(
        { message: "Admin IDs is required" },
        { status: 400 }
      );
    }

    const today = new Date();
    const expiryDate = new Date(today);
    expiryDate.setDate(today.getDate() + 14); // 14-day grace period

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: {
        subscriptionStatus: "CANCELATIONINPROGRESS",
        subscriptionExpiry: expiryDate,
        cancellationApprovalDate: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: "Cancellation approved",
      data: updatedAdmin
    });

  } catch (error) {
    console.error("Error approving cancellation:", error);
    return NextResponse.json(
      { success: false, message: "Failed to approve cancellation" },
      { status: 500 }
    );
  }
};