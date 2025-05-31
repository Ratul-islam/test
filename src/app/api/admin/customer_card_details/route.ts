import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: NextRequest) {
  try {
    const { adminId } = await req.json();


    const admin = await prisma.admin.findUnique({
      where: {
        id: adminId
      },
      select: {
        stripeCustomerId: true
      }
    })
    if (admin?.stripeCustomerId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: admin.stripeCustomerId,
        type: 'card', // Filter by card type
      });

      return NextResponse.json({ details: paymentMethods.data[0].card, status: 200 });
    }

    return NextResponse.json({ details: {}, status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
