import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid_token", request.url));
  }

  try {
    const user = await prisma.admin.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      return NextResponse.redirect(new URL("/sign-in?error=invalid_token", request.url));
    }

    await prisma.admin.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null
      }
    });

    const response = NextResponse.redirect(
      new URL(`/verify-email?email=${encodeURIComponent(user.email)}`, request.url)
    );
    
    // Set both email and password cookies
    response.cookies.set({
        name: 'pending_verification_email',
        value: user.email, 
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 10 
      });
      

    return response;

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL("/sign-in?error=verification_failed", request.url)
    );
  }
};