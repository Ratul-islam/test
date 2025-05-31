// src/app/magic-link-auth/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function MagicLinkAuth() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const performMagicAuth = async () => {
      try {
        // Call an API endpoint that will check the cookies and return the email
        const res = await fetch('/api/auth/validate-magic-auth', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Authentication failed");
        }
        
        const { email } = await res.json();
        
        if (!email) {
          throw new Error("No email found for authentication");
        }
        
        // Sign in using NextAuth's credentials provider, but without a password
        const result = await signIn("credentials", {
          email,
          isMagicLink: "true", // Special flag for your auth logic
          redirect: false
        });
        
        if (result?.error) {
          throw new Error(result.error);
        }
        
        // Successfully authenticated
        setStatus("success");
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        
      } catch (error) {
        console.error("Magic link auth error:", error);
        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Authentication failed");
      }
    };
    
    performMagicAuth();
  }, [router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="border-2 w-[100px] h-[100px] mx-auto flex items-center justify-center rounded-full border-black animate-pulse">
            <Image src="/email.svg" width={40} height={40} alt="Magic link" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold">Signing you in...</h1>
          <p className="mt-2 text-gray-600">Please wait while we authenticate your account.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <Image src="/error.svg" alt="Error" width={64} height={64} className="mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
          <p className="text-red-600">{errorMessage}</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="mt-6 px-4 py-2 bg-black text-white rounded-md"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <Image src="/success.svg" alt="Success" width={64} height={64} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Authentication Successful!</h1>
        <p className="mb-4">You&apos;re now signed in.</p>
        <p>Redirecting to your dashboard…</p>
      </div>
    </div>
  );
}