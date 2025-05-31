/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import StepOne from "@/app/components/sign-up/step-1";
import StepTwo from "@/app/components/sign-up/step-2";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { FETCH } from "@/app/services/fetch";

const SignUp = () => {
  const methods = useForm();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionId = useSearchParams().get("session_id");
  const router = useRouter();

  // Determine initial step based on auth method
  const [step, setStep] = useState<number>(() => {
    // If user is already signed in via Google (but hasn't completed setup)
    if (session?.user?.subscriptionStatus === "INCOMPLETE" || 
        session?.user?.userType === "UNSELECTED") {
      return 0; // Show type selection first
    }
    return 0;
  });

  const getStep = () => {
    switch (step) {
      case 0:
        return <StepOne setStep={setStep} />;
      case 1:
        return <StepTwo setStep={setStep}  />;
      default:
        return <StepOne setStep={setStep}/>;
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
          const userData = JSON.parse(
            localStorage.getItem("priced_signup_data")!
          );

          setLoading(true);
          setError("");
          try {
            await FETCH.post({
              url: "/auth",
              body: userData
            });
            const res: any = await signIn("credentials", {
              email: userData.email,
              password: userData.password,
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
      const res = await FETCH.post({
        url: "/auth",
        body: data
      });
      
      const signInRes: any = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false
      });
      
      if (signInRes.ok) {
        // For email/password users, proceed to payment directly
        setStep(1); // Move to payment step
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
                    className='h-12 w-12 border flex items-center justify-center rounded-[50%] shadow-md cursor-pointer hover:bg-black/10 duration-200'
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
              <span className='text-lg font-semibold'>0{step + 1} Of 02</span>
            </div>

            {getStep()}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SignUp;