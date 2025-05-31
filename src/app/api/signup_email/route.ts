import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const { name, email } = await req.json();
  console.log(name, email);

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "New Contact Form Submission",
    text: `Hello ${name},\n\nYour account has been successfully registered! Welcome to our platform.`,
    html: `<h1>Welcome ${name}!</h1><p>Your account has been successfully registered. We're excited to have you on board!</p>`
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);
    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error sending mail" },
      { status: 200 }
    );
  }
}
