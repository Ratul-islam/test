/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export const GET = async () => {
  try {
    const cookieStore = cookies();
    const email = (await cookieStore).get('pending_verification_email')?.value;
    const password = (await cookieStore).get('pending_verification_password')?.value;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'No verification session found' },
        { status: 400 }
      );
    }

    return NextResponse.json({ email, password });
  } catch (error:any) {
    return NextResponse.json(
      { error: 'Failed to retrieve credentials' },
      { status: 500 }
    );
  }
};