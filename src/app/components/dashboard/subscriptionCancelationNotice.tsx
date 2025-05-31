/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hourglass } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {  useSession } from "next-auth/react";

export default function SubscriptionCancellationNotice({
  expiry,
  email,
  onCancellationRemoved // Accept the prop
}: {
  expiry: Date;
  email: string;
  onCancellationRemoved: () => void; // Define the type for the prop
}) {
  const [loading, setLoading] = useState(false);
  const { data: session }: any = useSession();

  function getDaysDifference(targetDate: string | Date): {
    days: number;
    isPast: boolean;
  } {
    const target = new Date(targetDate);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const days = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));

    return {
      days: diffMs >= 0 ? days : -days,
      isPast: diffMs < 0
    };
  }

  const { days } = getDaysDifference(expiry);

  const handleRemoveCancellation = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscription/remove-cancellation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        onCancellationRemoved(); // Call the handler to update the parent state
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error removing cancellation request:", error);
      toast.error("An error occurred while removing the cancellation request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-gradient-to-b from-red-500 to-red-400 text-white p-6 rounded-lg text-center shadow-md'>
      <Hourglass className='text-yellow-400 text-3xl mx-auto mb-2' />
      {session.user?.subscriptionStatus === "PENDING" && (
        <>
          <p className='text-lg font-medium'>Service subject to cancellation</p>

        </>
      )}
      {session.user?.subscriptionStatus === "CANCELATIONINPROGRESS" && (
        <>
                  <p className='text-xl font-bold'>
            in <span className='font-extrabold'>{days} days.</span>
          </p>
          <p className='text-lg font-medium'>Service cancellation in progress</p>
          <p className='text-sm mt-2 italic opacity-80'>
            *Your data will be retained for 30 days.
          </p>
        </>
      )}
      <button
        onClick={handleRemoveCancellation}
        disabled={loading}
        className='mt-4 bg-black text-white font-semibold py-2 px-4 rounded-md hover:opacity-80'
      >
        {loading ? "Removing..." : "Remove cancellation request"}
      </button>
    </div>
  );
}