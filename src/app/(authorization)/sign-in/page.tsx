"use client";
import { useRouter, useSearchParams } from "next/navigation";
import Switcher4 from "@/app/components/switcher";
import { yupResolver } from "@hookform/resolvers/yup";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { object, string } from "yup";
import { signIn } from "next-auth/react";

const Schema = object({
  email: string()
    .required("Email is required")
    .email("Please enter a valid email"),
  password: string()
});

interface Inputs {
  email: string;
  password?: string;
}

const SignIn = () => {
  const [authError, setAuthError] = useState<string>("");
  const [magicLinkMode, setMagicLinkMode] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [checked, setIsChecked] = useState<boolean>(false);
  const [magicLinkSent, setMagicLinkSent] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isResendingVerification, setIsResendingVerification] = useState<boolean>(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState<string>("");
  const [verificationSent, setVerificationSent] = useState<boolean>(false);
  const [magicLinkTimer, setMagicLinkTimer] = useState<number>(0);

  const router = useRouter();
  const searchParams = useSearchParams();
  // const token = searchParams.get("token");
  // const paymentSuccess = searchParams.get("payment");
  const verificationError = searchParams.get("verification_error");

  const {
    register,
    handleSubmit,
    formState: { errors },
    // setValue,
    watch
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  const watchEmail = watch("email");

  // Handle auto-login after Stripe payment
  // In the useEffect for magic link detection
useEffect(() => {
  const checkMagicLinkAuth = async () => {
    // Check for magic link cookies
    const magicLinkAuth = document.cookie.split('; ')
      .find(row => row.startsWith('magic_link_auth='));
  
    const magicLinkEmail = document.cookie.split('; ')
      .find(row => row.startsWith('magic_link_email='))
      ?.split('=')[1];
  
    if (magicLinkAuth && magicLinkEmail) {
      // Show loading state
      setLoading(true);
      
      try {
        // Auto sign-in with magicLink parameter set to true
        const result = await signIn("credentials", {
          email: decodeURIComponent(magicLinkEmail),
          magicLink: 'true',
          redirect: false,
        });
  
        if (result?.ok) {
          // Clear the cookies first
          document.cookie = 'magic_link_auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          document.cookie = 'magic_link_email=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
          
          // Redirect to dashboard
          router.push("/dashboard");
        } else {
          setAuthError(result?.error || "Login failed");
          setLoading(false);
        }
      } catch (e) {
        console.error("Magic link auto-login failed", e);
        setAuthError("Magic link authentication failed. Please try again.");
        setLoading(false);
      }
    }
  };
  
  checkMagicLinkAuth();
}, [router]);
  // Handle verification errors from URL params
  useEffect(() => {
    if (verificationError) {
      setAuthError(decodeURIComponent(verificationError).replace(/\+/g, ' '));
    }
  }, [verificationError]);

  const handleResendVerification = async () => {
    const emailToUse = lastAttemptedEmail || watchEmail;

    if (!emailToUse) {
      setAuthError("Please enter your email address first");
      return;
    }

    setIsResendingVerification(true);

    try {
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailToUse }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend verification email');
      }

      setVerificationSent(true);
      setAuthError("");
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to resend verification email");
    } finally {
      setIsResendingVerification(false);
    }
  };

  const sendMagicLink = async (email: string) => {
    setLoading(true);
    setAuthError("");

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link');
      }

      setMagicLinkSent(true);
      setLastAttemptedEmail(email);

      // Start countdown timer for resend
      setMagicLinkTimer(60);
      const countdown = setInterval(() => {
        setMagicLinkTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Failed to send magic link");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    if (magicLinkMode) {
      // Send magic link
      await sendMagicLink(data.email);
      return;
    }

    setLoading(true);
    setAuthError("");
    setLastAttemptedEmail(data.email);

    try {
      // First check if email is verified
      const validateResponse = await fetch('/api/validate-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      const validateData = await validateResponse.json();

      if (validateResponse.ok && !validateData.verified) {
        setAuthError("Please verify your email before signing in");
        setLoading(false);
        return;
      }

      // If verification check passes or fails with not found, proceed with sign in attempt
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (res?.error) {
        if (res.error.includes("verify your email")) {
          setAuthError("Please verify your email before signing in");
        } else if (res.status === 401) {
          setAuthError("Incorrect password. Please try again.");
        } else {
          setAuthError(res.error || "Login failed. Please try again.");
        }
      } else if (res?.ok) {
        router.push("/dashboard");
      }
    } catch {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendMagicLink = async () => {
    if (magicLinkTimer > 0) return;
    await sendMagicLink(lastAttemptedEmail || watchEmail);
  };

  // If verification has been requested and sent
  if (verificationSent) {
    return (
      <div className='bg-white h-[400px] w-full flex flex-col items-center justify-center gap-y-6'>
        <div className='max-w-[555px] flex flex-col items-center justify-center'>
          <div className='border-2 w-[191px] h-[191px] flex items-center justify-center rounded-[50%] border-black animation-pulse'>
            <div className='border-2 w-[157px] h-[157px] flex items-center justify-center rounded-[50%] border-black'>
              <div className='border-2 w-[122px] h-[122px] flex items-center justify-center rounded-[50%] border-black'>
                <div className='border-2 w-[87px] h-[87px] flex items-center justify-center rounded-[50%] border-black'>
                  <Image
                    src='/email.svg'
                    height={44}
                    width={44}
                    alt='email'
                  />
                </div>
              </div>
            </div>
          </div>

          <span className='text-[24px] font-semibold mt-6'>
            Verification Email Sent
          </span>

          <p className='mt-1 text-center text-[14px] leading-[160%]'>
            We emailed a verification link to <br />
            <span className='font-semibold'>{lastAttemptedEmail || watchEmail}</span> <br />
            Click the link to verify your email and sign in.
          </p>

          <button
            onClick={() => setVerificationSent(false)}
            className='mt-6 text-[14px] font-semibold h-10 w-[146px] rounded-[12px] border-[#cbd5e1] border shadow-lg hover:bg-gray-100'
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Magic link sent screen
  if (magicLinkSent) {
    return (
      <div className='bg-white w-full flex flex-col items-center justify-center gap-y-6'>
        <div className='max-w-[555px] flex flex-col items-center justify-center'>
          <div className='border-2 w-[191px] h-[191px] flex items-center justify-center rounded-[50%] border-black animation-pulse'>
            <div className='border-2 w-[157px] h-[157px] flex items-center justify-center rounded-[50%] border-black'>
              <div className='border-2 w-[122px] h-[122px] flex items-center justify-center rounded-[50%] border-black'>
                <div className='border-2 w-[87px] h-[87px] flex items-center justify-center rounded-[50%] border-black'>
                  <Image
                    src='/email.svg'
                    height={44}
                    width={44}
                    alt='email'
                  />
                </div>
              </div>
            </div>
          </div>

          <span className='text-[24px] font-semibold mt-6'>
            Check Your Email
          </span>

          <p className='mt-1 text-center text-[14px] leading-[160%]'>
            We&#39;ve sent a magic link to <br />
            <span className='font-semibold'>{lastAttemptedEmail || watchEmail}</span> <br />
            Click the link to sign in instantly.
          </p>

          <div className='mt-6 flex flex-col items-center'>
            <button
              onClick={handleResendMagicLink}
              disabled={magicLinkTimer > 0 || loading}
              className={`text-[14px] font-semibold h-10 w-[180px] rounded-[12px] ${
                magicLinkTimer > 0 ? 'bg-gray-200 text-gray-500' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? "Sending..." :
                magicLinkTimer > 0 ? `Resend in ${magicLinkTimer}s` : "Resend Magic Link"}
            </button>

            <button
              onClick={() => {
                setMagicLinkSent(false);
                setMagicLinkMode(false);
              }}
              className='mt-3 text-[14px] font-semibold h-10 w-[180px] rounded-[12px] border-[#cbd5e1] border shadow-lg hover:bg-gray-100'
            >
              Sign in with password
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col gap-y-3'
    >
      {authError && !errors.email && !errors.password && (
        <div className="text-red-500 text-[14px] mt-1 p-3 bg-red-50 rounded-md">
          {authError}
          {authError.includes("verify your email") && (
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={isResendingVerification}
              className="ml-2 text-blue-500 underline hover:text-blue-700 focus:outline-none"
            >
              {isResendingVerification ? "Sending..." : "Resend verification email"}
            </button>
          )}
        </div>
      )}

      <div>
        <label className='text-[14px] font-medium'>Email</label>
        <input
          {...register("email")}
          placeholder='Enter email address'
          type='email'
          required
          className='h-12 p-2 max-w-[555px] w-full border-[0.5px] border-[#e5e5e5] bg-[#f2f2f2] rounded-[6px] focus:outline-none'
        />
        {errors.email && (
          <p className='text-red-500 text-[14px]'>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={`${magicLinkMode ? "max-h-0" : "max-h-screen"} relative overflow-hidden duration-500 transition-all`}>
        <label className='text-[14px] font-medium'>Password</label>
        <div className="relative">
          <input
            {...register("password")}
            placeholder='Enter password'
            type={showPassword ? "text" : "password"}
            className={`h-12 p-2 max-w-[555px] w-full border-[0.5px] ${
              authError?.includes("password") ? "border-red-500" : "border-[#e5e5e1]"
            } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
          />
          <div
            onClick={() => setShowPassword(prev => !prev)}
            className='absolute top-1/2 right-4 transform -translate-y-1/2 cursor-pointer'
          >
            <Image
              src={showPassword ? "/hide-password.svg" : "/show-password.svg"}
              height={24}
              width={24}
              alt='show'
            />
          </div>
        </div>
        {errors.password && (
          <p className='text-red-500 text-[14px] mt-1'>
            {errors.password.message}
          </p>
        )}
      </div>

      <div
        className={`${magicLinkMode ? "opacity-0 max-h-0" : "opacity-100 max-h-screen"} duration-500 transition-all flex items-center justify-between gap-x-3`}
      >
        <div className='flex items-center gap-x-2'>
          <Switcher4
            checked={checked}
            onChange={() => setIsChecked(true)}
          />
          <label className='text-[12px] font-medium'>Remember me</label>
        </div>
        <Link className='text-[#007aff] text-[12px] font-medium' href='/forgot-password'>
          Forgot password?
        </Link>
      </div>

      <button
        disabled={loading || isResendingVerification}
        className='mt-5 h-10 max-w-[555px] w-full rounded-[12px] bg-black text-white'
      >
        <span className='font-bold text-[15px] text-center'>
          {loading ? "Processing..." : magicLinkMode ? "Send Magic Link" : "Sign in"}
        </span>
      </button>

      <p
        className='mt-[30px] h-10 max-w-[555px] w-full rounded-[12px] border shadow-md cursor-pointer'
        onClick={() =>
          signIn("google", {
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`
          })
        }
      >
        <span className='font-bold text-[15px] text-center flex items-center justify-center gap-x-2 mt-2'>
          <Image
            src='/google.svg'
            width={20}
            height={20}
            alt='Google logo'
          />
          Continue with Google
        </span>
      </p>

      <div className='mx-auto mt-4 gap-x-2 flex'>
        <span className='text-[12px] font-medium block'>
          Don&#39;t have an account?
        </span>
        <Link
          href='/sign-up'
          className='text-[12px] font-medium text-[#007aff] block cursor-pointer'
        >
          Sign up now
        </Link>
      </div>

      <div
        className='mt-4 h-fit max-w-[555px] w-full bg-[#e5e5e5] rounded-[12px] p-4 flex gap-x-2 items-start'
        onClick={() => setMagicLinkMode(!magicLinkMode)}
      >
        <Image src='/magic-code.svg' height={24} width={24} alt='magic' />
        <p className='text-[14px] tracking-wide'>
          {magicLinkMode ? (
            <>
              We will email you a magic link for a password-free sign in. Or you can
              <span
                className='underline text-[#007aff] cursor-pointer ml-1'
              >
                sign in with password instead.
              </span>
            </>
          ) : (
            <>
              Use a password-free sign in option with our
              <span
                className='underline text-[#007aff] cursor-pointer ml-1'
              >
                magic link instead.
              </span>
            </>
          )}
        </p>
      </div>
    </form>
  );
};

export default SignIn;