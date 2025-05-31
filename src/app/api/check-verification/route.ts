/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';
import prisma from "@/app/utils/prismadb";

export const GET = async (request: NextRequest) => {
  try {
    const cookieStore = cookies();
    const email = (await cookieStore).get('pending_verification_email')?.value;
    
    if (!email) {
      return NextResponse.json(
        { verified: false, error: 'No verification session found' },
        { status: 200 }
      );
    }

    const user = await prisma.admin.findUnique({
      where: { email },
      select: { emailVerified: true }
    });

    return NextResponse.json({
      verified: !!user?.emailVerified,
      email
    });

  } catch (error) {
    console.error('Verification check error:', error);
    return NextResponse.json(
      { verified: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
};