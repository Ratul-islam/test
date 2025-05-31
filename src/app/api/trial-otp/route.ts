// app/api/send-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '../../../lib/email';
import client from '../../utils/prismadb';

type OTPRequestBody = {
  email: string;
  name: string;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: OTPRequestBody = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { message: 'Email and name are required' },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await client.oTPVerification.deleteMany({
      where: {
        email,
        verified: false
      }
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    const otpRecord = await client.oTPVerification.create({
      data: {
        email,
        otp,
        expiresAt,
        verified: false
      }
    });

    console.log(`OTP stored with ID: ${otpRecord.id}`);

    await sendOTPEmail({
      email,
      name,
      otp,
      expirationMinutes: 10
    });

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        otpId: otpRecord.id
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-otp API:', error);
    return NextResponse.json(
      { 
        message: 'Failed to send OTP email',
        error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
