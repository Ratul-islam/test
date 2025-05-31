/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useFormContext } from "react-hook-form";
import { Isteps } from "./@types";
import { Check, Star } from "lucide-react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { useSession } from "next-auth/react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Price IDs from Stripe dashboard
const PRICES = {
  STUDIO_BASE: "price_1R9aG1LaglMDfP0HjGvHtnoE", // £14.99 base fee
  ARTIST_ADDON: "price_1RAhMhLaglMDfP0HKpIkaxbH"  // £10 per artist (replace with your actual price ID)
};

const StepZero: React.FC<Isteps> = ({ }) => {
  const { getValues, register, watch, setValue, formState: { isValid } } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formData = watch();

  const { data: session } = useSession();


  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanedValue = value.replace(/\D/g, ''); // Remove non-numeric characters
    const limitedValue = Math.min(Number(cleanedValue), 20).toString(); // Ensure max value of 20
    setValue("number_of_artist", limitedValue);
  };

const handleStudioSubscription = async () => {
  if (!isValid) {
    setError("Please fill in all required fields correctly");
    return;
  }

  const formData = getValues();
  const userType = formData.user_type;
  const email = formData.email || session?.user?.email;

  if (!email) {
    setError("Email is required for payment.");
    setLoading(false);
    return;
  }

  const numberOfArtists = Number(formData.number_of_artist || 0);
  if (numberOfArtists < 0 || numberOfArtists > 20) {
    setError("Number of artists must be between 0-20");
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const name = formData.name || session?.user?.name || "";
    const phone = formData.phone || "";
    const password = formData.password || ""; // Might be empty for Google signup

    // Save form data including number of artists
    localStorage.setItem("priced_signup_data", JSON.stringify({
      email,
      name,
      phone,
      password,
      user_type: userType,
      number_of_artist: numberOfArtists,
      trial: true
    }));

    // Prepare line items
    const lineItems = [{
      price: PRICES.STUDIO_BASE,
      quantity: 1
    }];

    if (numberOfArtists > 0) {
      lineItems.push({
        price: PRICES.ARTIST_ADDON,
        quantity: numberOfArtists
      });
    }

    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        line_items: lineItems,
        customer_email: email,
        success_url: `${window.location.origin}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/sign-up`,
        metadata: {
          user_data: JSON.stringify({
            email,
            name,
            phone,
            password,
            userType,
            number_of_artists: numberOfArtists
          })
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create subscription");
    }

    const { sessionId } = await response.json();
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error("Stripe failed to initialize");
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      throw error;
    }

  } catch (err) {
    console.error("Subscription error:", err);
    let errorMessage = "Payment processing failed. Please try again later.";

    if (err instanceof Error) {
      errorMessage = err.message.includes('price')
        ? "Invalid subscription plan. Please contact support."
        : err.message;
    }

    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const handleArtistSubscription = async () => {
  setLoading(true);
  setError(null);

  try {
    const formData = getValues();
    const userType = formData.user_type;

    const email = formData.email || session?.user?.email;

    if (!email) {
      setError("Email is required for payment.");
      setLoading(false);
      return;
    }

    // Save ALL form data including number of artists
    localStorage.setItem("priced_signup_data", JSON.stringify(formData));

    // Prepare line items array
    const lineItems = [{
      price: PRICES.STUDIO_BASE,
      quantity: 1
    }];

    if (formData.number_of_artist > 0) {
      lineItems.push({
        price: PRICES.ARTIST_ADDON,
        quantity: formData.number_of_artist
      });
    }

    const response = await fetch("/api/create-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        line_items: lineItems,
        customer_email: email, // ✅ Use resolved email here
        success_url: `${window.location.origin}/api/stripe-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${window.location.origin}/sign-up`,
        metadata: {
          user_data: JSON.stringify({ ...formData, email }) // ✅ Ensure email is included in metadata too
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Payment failed");
    }

    const stripe = await stripePromise;
    const result = await stripe!.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (result.error) {
      throw result.error;
    }
  } catch (err) {
    console.error("Stripe error:", err);
    setError(err instanceof Error ? err.message : "Payment processing failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <h2 className='text-3xl font-semibold my-6'>
        Pick a plan that is suitable for you.
      </h2>

      {error && (
        <div className="text-red-500 mb-4 text-center">
          {error}
        </div>
      )}

      {getValues("user_type") === "studio" ? (
        <div className='bg-gradient-to-b from-indigo-300 to-white p-6 rounded-2xl shadow-lg max-w-sm mx-auto'>
          <div className='bg-white px-3 py-1 rounded-full text-sm font-medium w-fit shadow-sm'>
            Studio
          </div>
          <h2 className='text-3xl font-bold mt-4'>
            £14.99 <span className='text-lg font-medium'>/ month</span>
          </h2>
          <p className='text-gray-500 text-sm'>+ £10 per artist/month</p>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of artists (0-20)
            </label>
            <input
              {...register("number_of_artist")}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={handleNumberInput}
              placeholder='Enter number of artists'
              className='h-12 p-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
            />
          </div>

          <div className="mt-2 text-sm text-gray-600">
            Total: £{14.99 + (Number(getValues("number_of_artist") || 0) * 10)}/month
          </div>

          <button
            onClick={handleStudioSubscription}
            disabled={loading}
            type='button'
            className='mt-4 w-full bg-black text-white py-3 rounded-md text-lg font-medium hover:bg-gray-800 disabled:opacity-50'
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>

          <div className='mt-4 space-y-2 text-sm text-gray-700'>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> Studio base fee: £14.99/month
            </p>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> £10 per additional artist/month
            </p>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> Manage all artists in one dashboard
            </p>
          </div>
        </div>
      ) : (
        <div className='bg-gradient-to-b from-indigo-300 to-white p-6 rounded-2xl shadow-lg max-w-sm mx-auto mt-6'>
          <div className='bg-white px-3 py-1 rounded-full text-sm font-medium w-fit shadow-sm'>
            Artist
          </div>
          <h2 className='text-3xl font-bold mt-4'>
            £14.99 <span className='text-lg font-medium'>/ month</span>
          </h2>
          <p className='text-gray-500 text-sm'>Premium features for artists</p>

          <button
            onClick={handleArtistSubscription}
            disabled={loading}
            type='button'
            className='mt-4 w-full bg-black text-white py-3 rounded-md text-lg font-medium hover:bg-gray-800 disabled:opacity-50'
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>

          <div className='mt-4 space-y-2 text-sm text-gray-700'>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> Full artist profile
            </p>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> Portfolio showcase
            </p>
            <p className='flex items-center gap-2'>
              <Check className='text-black w-4 h-4' /> Booking management
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepZero;