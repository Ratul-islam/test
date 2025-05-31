import { sendWelcomeVideosEmail } from '@/lib/email';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name, description, social, userType } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Send email with welcome videos
    await sendWelcomeVideosEmail({
      email,
      name: name || 'there',
      description,
      social,
      userType
    });

    return NextResponse.json(
      { success: true, message: 'Welcome videos email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending welcome videos email:', error);
    return NextResponse.json(
      { error: 'Failed to send welcome videos email' },
      { status: 500 }
    );
  }
}