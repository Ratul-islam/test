/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { signIn } from 'next-auth/react';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const getCookie = (name: string) => {
    try {
      if (typeof document === 'undefined') return undefined;
      const value = document.cookie
        .split('; ')
        .find(row => row.startsWith(`${name}=`))
        ?.split('=')[1];
      return value ? decodeURIComponent(value) : undefined;
    } catch (error) {
      console.error(`Error reading cookie ${name}:`, error);
      return undefined;
    }
  };

  useEffect(() => {
    if (!emailParam) {
      setError('No email provided for verification');
      setIsLoading(false);
      return;
    }

    const checkVerification = async () => {
      try {
        setIsLoading(true);
        
        // Debug cookies
        const emailCookie = getCookie('pending_verification_email');
        const passwordCookie = getCookie('pending_verification_password');
        console.log('Cookies:', { emailCookie, passwordCookie });
        const password = passwordCookie;
        
        // 1. Check verification status
        const verificationRes = await fetch('/api/check-verification');
        if (!verificationRes.ok) {
          throw new Error(`Verification check failed with status ${verificationRes.status}`);
        }

        const verificationData = await verificationRes.json();
        if (verificationData.error) {
          throw new Error(verificationData.error);
        }

        if (verificationData.verified) {
          setIsVerified(true);
          
          // 3. Auto sign-in
          const result = await signIn('credentials', {
            email: emailParam,
            password: password,
            redirect: false,
          });

          // 4. Clear cookies
          document.cookie = 'pending_verification_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'pending_verification_password=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';

          if (result?.error) {
            throw new Error(result.error);
          }
          
          if (result?.ok) {
            // Show thank you message for 2 seconds before redirecting
            setTimeout(() => {
              router.push("/dashboard");
            }, 3000);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed';
        console.error('Verification error:', message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [emailParam]);

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
            <div className="mx-auto w-24 h-24 relative mb-6">
              <Image
                src="/logo.png" // You might want to add a success icon
                alt="Success Icon"
                fill
              />
            </div>
            <h1 className="text-2xl font-bold mb-4">Thank you for joining us!</h1>
            <p className="mb-6">
              Your email has been successfully verified.
            </p>
          </div>
        </div>
      );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="mx-auto w-24 h-24 relative mb-6">
            <Image
              src="/logo.png" // You might want to add a success icon
              alt="Success Icon"
              fill
            />
          </div>
          <h1 className="text-2xl font-bold mb-4">Thank you for joining us!</h1>
          <p className="mb-6">
            Your email has been successfully verified. You will be redirected to your dashboard shortly.
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="mb-6">
          We have sent a verification link to <span className="font-semibold">{emailParam}</span>.
          You will be automatically redirected after verification.
        </p>

          <p className="text-gray-600">
            If you are not automatically redirected, please check your email and click the verification link.
          </p>
      </div>
    </div>
  );
}