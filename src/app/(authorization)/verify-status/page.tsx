"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function VerificationStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleResendVerification = async () => {
    if (!email) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }
      
      setError("Verification email has been resent. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto w-24 h-24 relative mb-6">
          <Image
            src="/email.svg"
            alt="Email Icon"
            fill
            className="animate-pulse"
          />
        </div>
        <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
        <p className="mb-6">
          We have sent a verification link to <span className="font-semibold">{email}</span>.
          Please check your inbox and click the verification link to activate your account.
        </p>
        
        <button
          onClick={handleResendVerification}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-md text-lg font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend Verification Email"}
        </button>
        
        {error && (
          <p className={`mt-4 text-sm ${error.includes("has been resent") ? "text-green-500" : "text-red-500"}`}>
            {error}
          </p>
        )}
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Already verified? <button 
            onClick={() => router.push('/sign-in')}
            className="text-blue-500 hover:underline"
          >
            Sign in
          </button></p>
        </div>
      </div>
    </div>
  );
}