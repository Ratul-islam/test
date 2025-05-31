// src/app/api/validate-account/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.admin.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found", verified: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: !!user.emailVerified
    });

  } catch (error) {
    console.error("Validate account error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}