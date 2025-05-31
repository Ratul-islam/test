import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: "example@gmail.com", // change the email to where want to receive
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ message: "Error sending mail" }, { status: 200 });
    }
  }
