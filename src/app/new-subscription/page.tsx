/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"; // Mark this as a Client Component

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Subscribe() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (price_id: string) => {
    try {
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          priceId: price_id, // Replace with your Price ID
          customerEmail: "user@example.com" // Replace with user's email
        })
      });

      // Read the response once
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const { sessionId } = data;
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create subscription. Please try again.");
    }
  };

  return (
    <div>
      <h1>Choose a Plan</h1>
      <button
        onClick={() => handleSubscribe("price_1R5HKPJLqSCdRfNR2KmqxGKM")}
        disabled={loading}
      >
        {loading ? "Loading..." : "Subscribe Monthly"}
      </button>
      <button
        onClick={() => handleSubscribe("price_yyyyyyyyyyyyyyyyyyyyyyyy")}
        disabled={loading}
      >
        {loading ? "Loading..." : "Subscribe Yearly"}
      </button>
    </div>
  );
}
