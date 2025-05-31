// app/api/verify-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import client from '../../../utils/prismadb';


export async function POST(request: NextRequest) {
  try {
    const { otpId, email, otp } = await request.json();

    console.log('Verifying OTP for:', email, 'with ID:', otpId);

    if (!otpId || !email || !otp) {
      return NextResponse.json(
        { message: 'OTP ID, email, and OTP are required' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const record = await (client).oTPVerification.findUnique({
      where: { id: otpId }
    });
    
    if (!record) {
      return NextResponse.json(
        { message: 'OTP not found or expired', verified: false },
        { status: 400 }
      );
    }
    
    if (record.email !== email) {
      return NextResponse.json(
        { message: 'Invalid email for this OTP', verified: false },
        { status: 400 }
      );
    }
    
    if (record.expiresAt < new Date()) {
      // Delete expired OTP
      await (client ).oTPVerification.delete({
        where: { id: otpId }
      });
      return NextResponse.json(
        { message: 'OTP has expired', verified: false },
        { status: 400 }
      );
    }
    
    if (record.verified) {
      return NextResponse.json(
        { message: 'OTP has already been used', verified: false },
        { status: 400 }
      );
    }
    
    if (record.otp !== otp) {
      return NextResponse.json(
        { message: 'Invalid OTP', verified: false },
        { status: 400 }
      );
    }
    
    // Delete the OTP record after successful verification
    await (client ).oTPVerification.delete({
      where: { id: otpId }
    });
    
    console.log(`OTP verified successfully for ${email}`);
    
    return NextResponse.json(
      { message: 'OTP verified successfully', verified: true },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { message: 'Failed to verify OTP', verified: false },
      { status: 500 }
    );
  }
}