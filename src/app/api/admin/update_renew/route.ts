import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function PUT(req: NextRequest) {
  try {
    const { adminId, checked } = await req.json();

    const updatedAdmin = await prisma?.admin.update({
      where: {
        id: adminId
      },
      data: {
        autoRenew: checked
      }
    });

    if (updatedAdmin && updatedAdmin.stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: updatedAdmin.stripeCustomerId
      });

      if (subscriptions.data.length > 0) {
        const existingSubscription = subscriptions.data[0];

        if (checked) {
          await stripe.subscriptions.update(existingSubscription.id, {
            cancel_at_period_end: false,
            items: [
              {
                id: existingSubscription.items.data[0].id,
                price: process.env.PRICE_ID_AUTO_RENEWAL
              }
            ]
          });

        } else {
          await stripe.subscriptions.update(existingSubscription.id, {
            cancel_at_period_end: true
          });
        }
      } else {
        if (checked && subscriptions.data.length < 1) {
          await stripe.subscriptions.create({
            customer: updatedAdmin.stripeCustomerId,
            items: [
              {
                price: process.env.PRICE_ID_AUTO_RENEWAL
              }
            ],
            trial_end: Math.floor(
              new Date(updatedAdmin.subscriptionExpiry).getTime() / 1000
            )
          });
        }
      }
    }

    return NextResponse.json(updatedAdmin, { status: 200 });
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
