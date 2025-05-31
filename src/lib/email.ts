// lib/email.ts

import nodemailer from 'nodemailer';

// Create a reusable transporter for a real email service instead of Mailtrap
const transporter = nodemailer.createTransport({
  service: 'gmail', // e.g., 'gmail', 'SendGrid', etc.
  // host: process.env.SMTP_HOST,
  // port: Number(process.env.SMTP_PORT),
  // secure: process.env.SMTP_SECURE === 'true',
  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASS
  // }

  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
}, {
  debug: true, // Add this
});

/**
 * Send the verification email with a one-time token link.
 */
export const sendVerificationEmail = async ({
  email,
  name,
  token
}: {
  email: string;
  name: string;
  token: string;
}) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${token}`;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
      to: email,
      subject: 'Please verify your email address',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Hi ${name},</h1>
        <p>Thank you for signing up! To complete your registration, please verify your email by clicking the button below:</p>
        <p style="margin: 25px 0;">
          <a href="${verificationUrl}"
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this, simply ignore this email.
        </p>
      </div>`
    });

    console.log(`Verification email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
};

/**
 * Send welcome email with two getting-started video links.
 */
export const sendWelcomeVideosEmail = async ({
  email,
  name,
  description,
  social,
  userType
}: {
  email: string;
  name: string;
  description?: string;
  social?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  userType?: string;
}) => {
  // Example video URLs—swap in your real content URLs if needed
  const videoUrl1 = 'https://v.ftcdn.net/05/74/49/89/700_F_574498902_ygftpM1Sf9zFFdOFptXAkCObsvqTPfKp_ST.mp4';
  const videoUrl2 = 'https://v.ftcdn.net/12/37/34/47/700_F_1237344766_zccX1zyvuTbwjMzeiD5OP9Edd8ZkbshU_ST.mp4';

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
      to: email,
      subject: 'Welcome to Your Free Trial! Here Are Your Getting Started Videos',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome, ${name}!</h1>
        <p>Thank you for starting your free trial as a <strong>${
          userType === 'artist' ? 'Creative Artist' : 'Tattoo Studio'
        }</strong>. To help you get up and running, we've prepared two short videos:</p>
        
        <div style="margin: 25px 0; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Getting Started Video</h2>
          <p>This video walks you through the basics:</p>
          <p style="margin: 15px 0;">
            <a href="${videoUrl1}" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Watch Video 1
            </a>
          </p>
        </div>
        
        <div style="margin: 25px 0; background-color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-top: 0;">Advanced Features Video</h2>
          <p>Learn about our advanced features:</p>
          <p style="margin: 15px 0;">
            <a href="${videoUrl2}" 
               style="background-color: #2563eb; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 6px; display: inline-block;">
              Watch Video 2
            </a>
          </p>
        </div>
        
        ${
          description
            ? `<p>Thanks for sharing your thoughts:</p>
               <blockquote style="border-left: 4px solid #2563eb; padding-left: 15px; color: #555;">
                 ${description}
               </blockquote>`
            : ''
        }
        
        ${
          social && Object.values(social).some(Boolean)
            ? `<div style="margin-top: 20px;">
               <p>We've connected your social profiles:</p>
               <ul style="list-style:none; padding:0;">
                 ${social.instagram ? `<li>Instagram: ${social.instagram}</li>` : ''}
                 ${social.tiktok ? `<li>TikTok: ${social.tiktok}</li>` : ''}
                 ${social.facebook ? `<li>Facebook: ${social.facebook}</li>` : ''}
               </ul>
             </div>`
            : ''
        }
        
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          If you have any questions, reply to this email or contact our support team.
        </p>
        <p style="margin-top: 30px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px;">
          Thanks for choosing us!<br/>The Team
        </p>
      </div>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Email preview URL:', previewUrl);
    }

    console.log(`Welcome videos email sent to ${email}: ${info.messageId}`);
  } catch (err) {
    console.error('Error sending welcome videos email:', err);
    throw err;
  }
};

export const sendMagicLinkEmail = async ({
  email,
  name,
  token,
  isNewUser = false
}: {
  email: string;
  name: string;
  token: string;
  isNewUser?: boolean;
}) => {
  const magicLinkUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/email?token=${token}&email=${encodeURIComponent(email)}`;
  const actionText = isNewUser ? "Create your account" : "Sign in";
  const greeting = isNewUser ? "Welcome" : "Welcome back";
console.log("gg");
console.log(process.env.EMAIL_SERVER_USER)
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
      to: email,
      subject: `Your magic link to ${isNewUser ? 'sign up' : 'sign in'}`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${greeting}, ${name}!</h1>
        <p>Here's your magic link to ${isNewUser ? 'create your account' : 'sign in'} with a single click:</p>
        <p style="margin: 25px 0;">
          <a href="${magicLinkUrl}"
             style="background-color: #000000; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            ${actionText}
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link will expire in 10 minutes for security reasons.</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          If you didn't request this link, you can safely ignore this email.
        </p>
      </div>`
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('Magic link email preview URL:', previewUrl);
    }

    console.log(`Magic link email sent to ${email}: ${info.messageId}`);
  } catch (err) {
    console.error('Error sending magic link email:', err);
    throw err;
  }
};

/**
 * Send OTP verification email for free trial signup
 */
export const sendOTPEmail = async ({
  email,
  name,
  otp,
  expirationMinutes = 10
}: {
  email: string;
  name: string;
  otp: string;
  expirationMinutes?: number;
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Your App" <no-reply@yourapp.com>',
      to: email,
      subject: 'Your Verification Code for Free Trial',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">Email Verification</h1>
          <p style="color: #666; font-size: 16px;">Complete your free trial signup</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <h2 style="color: #333; margin-bottom: 15px;">Hello ${name}!</h2>
          <p style="color: #666; margin-bottom: 25px;">Enter this verification code to continue:</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 2px solid #e9ecef; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #000; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </span>
          </div>
          
          <p style="color: #dc3545; font-weight: 600; margin-top: 20px;">
            ⏰ This code expires in ${expirationMinutes} minutes
          </p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Note:</strong> Never share this code with anyone. Our team will never ask for your verification code.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            If you didn't request this verification code, please ignore this email.
          </p>
          <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
            This is an automated message, please do not reply.
          </p>
        </div>
      </div>`
    });

    console.log(`OTP email sent to ${email}: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('Error sending OTP email:', err);
    throw err;
  }
};