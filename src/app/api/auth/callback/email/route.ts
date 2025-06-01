import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
// import { setCookie } from "cookies-next";
// import { getToken } from "next-auth/jwt";
import { encode } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      return NextResponse.redirect(new URL("/sign-in?error=Invalid+magic+link", request.url));
    }


    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token: token },
    });

    if (!verificationToken || verificationToken.identifier !== email) {
      return NextResponse.redirect(new URL("/sign-in?error=Invalid+or+expired+magic+link", request.url));
    }

    if (new Date() > verificationToken.expires) {
      await prisma.verificationToken.delete({ where: { token: token } });
      return NextResponse.redirect(new URL("/sign-in?error=Magic+link+expired", request.url));
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          emailVerified: new Date(),
        },
      });
    } else if (!user.emailVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    await prisma.verificationToken.delete({ where: { token: token } });

    // Manually create a JWT token
    const jwtToken = await encode({
      token: {
        name: user.name,
        email: user.email,
        picture: user.image,
        sub: user.id,
      },
      secret: NEXTAUTH_SECRET,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    const response = NextResponse.redirect(new URL("/dashboard", request.url)); // Redirect to dashboard or homepage

    // Set session cookie
    response.cookies.set("next-auth.session-token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Magic link callback error:", error);
    return NextResponse.redirect(new URL("/sign-in?error=Authentication+failed", request.url));
  }
}
