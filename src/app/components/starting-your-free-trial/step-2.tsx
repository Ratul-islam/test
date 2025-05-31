"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormData, Isteps } from "./@types";
import { useState, useEffect } from "react";

const Schema = object({
  otp: string()
    .required("OTP is required")
    .matches(/^\d{6}$/, "OTP must be exactly 6 digits")
    .length(6, "OTP must be 6 digits")
});

interface Inputs {
  otp: string;
}

interface IStepTwoProps extends Isteps {
  updateFormData?: (data: FormData) => void;
}

const StepTwo: React.FC<IStepTwoProps> = ({ setStep, updateFormData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string>('');
  const [otpId, setOtpId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  // Get email and otpId from sessionStorage on component mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('otpEmail');
    const storedOtpId = sessionStorage.getItem('otpId');
    
    if (storedEmail && storedOtpId) {
      setEmail(storedEmail);
      setOtpId(storedOtpId);
    }
  }, []);

  // Function to mask email for display
  const maskEmail = (email: string) => {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return `${localPart[0]}*@${domain}`;
    }
    const maskedLocal = localPart[0] + '*'.repeat(Math.max(localPart.length - 2, 1)) + localPart.slice(-1);
    return `${maskedLocal}@${domain}`;
  };

  // Function to verify OTP via trial-otp/verify API route
  const verifyOTPViaAPI = async (otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/trial-otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otpId,
          email,
          otp
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.verified) {
        return { success: true, message: data.message };
      }
      
      return { success: false, message: data.message || 'Invalid OTP' };
    } catch (error) {
      console.error('Error verifying OTP via API:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await verifyOTPViaAPI(data.otp);
      
      if (result.success) {
        // Clear OTP data from session storage
        sessionStorage.removeItem('otpId');
        sessionStorage.removeItem('otpEmail');
        
        // Update form data to mark OTP as verified
        if (updateFormData) {
          updateFormData({ ...data, otpVerified: true } as unknown as FormData);
        }
        
        // Proceed to next step
        setStep(prev => prev + 1);
      } else {
        setError(result.message);
        setValue('otp', ''); // Clear the input
      }
      
    } catch (error) {
      console.error('Error in OTP verification:', error);
      setError('An error occurred while verifying the code. Please try again.');
      setValue('otp', ''); // Clear the input
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className='w-full flex flex-col gap-5'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Email and Phone <br />
          Number Verification.
        </h2>
        <p className='tracking-wide text-base w-full'>
          A code will be sent to your email and phone for verification
        </p>
        <span className='tracking-wide text-sm w-full flex items-center'>
          {email ? maskEmail(email) : 'g********01@gmail.com'}{" "}
          <button
            type="button"
            onClick={() => {
              setStep(prev => prev - 1);
            }}
            className='font-bold underline ml-2 text-sm'
          >
            Edit
          </button>
        </span>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className='w-full flex flex-col gap-3'>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Enter OTP</label>
          <input
            {...register("otp")}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.otp ? "border-red-700" : "border-borderColor"}
                ${isLoading ? "opacity-50" : ""}
                `}
            placeholder='Enter OTP'
            disabled={isLoading}
            autoComplete="one-time-code"
          />
          {errors.otp && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.otp.message}
            </p>
          )}
        </div>
        <div className='mt-4 flex items-center gap-2'>
          <button
            disabled={!!Object.keys(errors)?.length || isLoading}
            type='submit'
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <span>→</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(prev => prev - 1);
            }}
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-transparent text-black rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-borderColor'
            disabled={isLoading}
          >
            Go Back
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepTwo;