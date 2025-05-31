// src/app/api/auth/callback/email/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.redirect(new URL('/sign-in?error=Invalid+magic+link', request.url));
    }

    
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.redirect(new URL('/sign-in?error=Invalid+or+expired+magic+link', request.url));
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete the expired token
      await prisma.verificationToken.delete({
        where: { token }
      });
      return NextResponse.redirect(new URL('/sign-in?error=Magic+link+expired', request.url));
    }

    // Check if the user exists
    const user = await prisma.admin.findUnique({
        where: { email }
      });
    
    if (!user) {
      // For new users, redirect to complete signup
      return NextResponse.redirect(
        new URL(`/sign-up?email=${encodeURIComponent(email)}&verified=true`, request.url)
      );
    }

    // If user exists but email not verified, verify it now
    if (!user.emailVerified) {
      await prisma.admin.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }

    // Delete the token as it's been used
    await prisma.verificationToken.delete({
      where: { token }
    });

    
    const response = NextResponse.redirect(new URL('/sign-in', request.url));
    
    
    response.cookies.set({
      name: 'magic_link_auth',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10 // 10 minutes
    });
    
    response.cookies.set({
      name: 'magic_link_email',
      value: email,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 10 // 10 minutes
    });

    return response;

  } catch (error) {
    console.error('Magic link callback error:', error);
    return NextResponse.redirect(
      new URL('/sign-in?error=Authentication+failed', request.url)
    );
  }
}