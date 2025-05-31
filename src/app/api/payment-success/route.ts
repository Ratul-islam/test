import Stripe from 'stripe';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const session_id = url.searchParams.get('session_id');
    const adminId = url.searchParams.get('adminId');
    const leadId = url.searchParams.get('leadId');

    if (!session_id) {
      return new Response('Missing session_id', { status: 400 });
    }
    if (!adminId || !leadId) {
        return new Response('Missing required parameters (adminId or leadId)', { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(session_id);


    if (session.payment_status !== 'paid') {
      return new Response('Payment not completed', { status: 400 });
    }

    const customerEmail = session.customer_details?.email;

    if (!customerEmail) {
      return new Response('No customer email found', { status: 400 });
    }
transporter.sendMail({
  from: process.env.EMAIL_SERVER_USER,
  to: customerEmail,
  subject: 'Payment Successful - Tattoo Appointment Confirmation',
  html: `
    <h2>Thank you for your payment!</h2>
    <p>Your tattoo appointment has been successfully confirmed.</p>
    <h3>Appointment Details:</h3>
    <ul>
      <li><strong>Reference ID:</strong> ${leadId}</li>
      <li><strong>Payment Status:</strong> ${session.payment_status}</li>
    </ul>
    <p>If you have any questions or need to reschedule, please contact us at <a href="mailto:${process.env.EMAIL_SERVER_USER}">${process.env.EMAIL_SERVER_USER}</a>.</p>
    <p>We look forward to creating amazing art with you!</p>
    <br />
    <p>Best regards,<br/>Tattoo Studio Team</p>
  `,
});


    return new Response(null, {
      status: 302,
      headers: {
        Location: `${process.env.NEXT_PUBLIC_BASE_URL}/tattoo-viewer/${adminId}?alert=success`,
      },
    });
  } catch (error) {
    console.error('Error in payment success handler:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
