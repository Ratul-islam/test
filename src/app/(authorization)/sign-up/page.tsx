/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import StepZero from "@/app/components/sign-up/step-0";
import StepOne from "@/app/components/sign-up/step-1";
import StepTwo from "@/app/components/sign-up/step-2";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { FETCH } from "@/app/services/fetch";

const SignUp = () => {
  const methods = useForm();
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionId = useSearchParams().get("session_id");
  const router = useRouter();

  const [step, setStep] = useState<number>(0);

  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  const getStep = () => {
    switch (step) {
      case 0:
        return <StepZero setStep={setStep} />;
      case 1:
        return <StepOne setStep={setStep} />;
      case 2:
        return <StepTwo setStep={setStep} />;
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const result = await signIn("google", {
        callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      });
      
      if (result?.error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `/api/validate-session?session_id=${sessionId}`
        );

        const data = await response.json();

        if (data.valid) {
          console.log("TOken is Valid?");
          const userData = JSON.parse(
            localStorage.getItem("priced_signup_data")!
          );

          setLoading(true);
          setError("");
          try {
            await FETCH.post({
              // eslint-disable-next-line @typescript-eslint/no-explicit-any

              url: "/auth",
              body: userData
            });
            const res: any = await signIn("credentials", {
              email: userData.email,
              password: userData.password,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any

              redirect: false
            });
            if (res.ok) {
              router.push("/dashboard");
            }
          } catch (err: any) {
            setError(err.message || "Something went wrong");
          } finally {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Error validating session:", error);
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, [sessionId, router]);

  const handleSignUp = async (data: FieldValues) => {
    try {
      setLoading(true);
      setError("");
  
      const response = await FETCH.post({
        url: "/auth",
        body: data
      });
      
      // Add type assertion or check if the property exists
      if (typeof response === 'object' && response !== null && 'requiresVerification' in response) {
        if (response.requiresVerification) {
          // Show verification notice instead of auto sign-in
          setVerificationSent(true);
          setVerificationEmail(data.email);
          return;
        }
      }
      
      const res: any = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      });
      
      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }
      
      // Show success message
      setError("Verification email has been resent.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email");
    } finally {
      setLoading(false);
    }
  };

  // If verification email was sent, show verification screen
  if (verificationSent) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent a verification email to <strong>{verificationEmail}</strong>.<br />
              Please check your inbox and click the verification link to complete your registration.
            </p>
          
          <button
            onClick={handleResendVerification}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend Verification Email"}
          </button>
          
          {error && (
            <p className={`mt-4 text-sm ${error.includes("has been resent") ? "text-green-500" : "text-red-500"}`}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSignUp)}
          className='flex flex-col gap-y-3'
        >
          <div className=''>
            <div className='flex items-center justify-between gap-x-3 max-w-[860px] w-full border-b pb-10 tablet:pb-2 tablet:mt-6'>
              <div className='flex items-center gap-x-5'>
                {step > 0 ? (
                  <div
                    onClick={() => setStep(prev => prev - 1)}
                    className='
                h-12 w-12 border flex items-center justify-center rounded-[50%] shadow-md cursor-pointer hover:bg-black/10 duration-200'
                  >
                    <Image
                      src='/arrow-left.svg'
                      height={30}
                      width={30}
                      alt='back'
                    />
                  </div>
                ) : null}
                <span className='text-lg font-semibold '>Steps</span>
              </div>
              <span className='text-lg font-semibold'>0{step + 1} Of 03</span>
            </div>

            {/* forms */}
            {methods.formState.isSubmitting ? (
              <button
                disabled={methods.formState.isSubmitting}
                className='mt-5 h-10 max-w-[555px] w-full rounded-[12px] bg-black'
              >
                <span className='font-bold text-[15px] text-center text-white'>
                  {loading ? "Signing up..." : "Sign up"}
                </span>
              </button>
            ) : (
              getStep()
            )}
          </div>
        </form>
      </FormProvider>

      {/* Show Google button only in step 0 */}
      {step === 0 && (
        <>
          <button
            className='mt-[50px] h-10 max-w-[555px] w-full rounded-[12px] border shadow-md cursor-pointer disabled:opacity-50'
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <span className='font-bold text-[15px] text-center flex items-center justify-center gap-x-2 mt-2'>
              {googleLoading ? (
                "Processing..."
              ) : (
                <>
                  <Image src='/google.svg' width={20} height={20} alt='Google logo' />
                  Continue with Google
                </>
              )}
            </span>
          </button>
          {error && (
            <div className="mt-2 text-red-500 text-center max-w-[555px]">
              {error}
            </div>
          )}
        </>
      )}

      <div className='mx-auto mt-4 gap-x-2 flex'>
        <span className='text-[12px] font-medium block'>
          Already have an account?
        </span>
        <Link
          href='/sign-in'
          className='text-[12px] font-medium text-[#007aff] block cursor-pointer'
        >
          Sign in
        </Link>
      </div>
    </div>
  );
};
export default SignUp;