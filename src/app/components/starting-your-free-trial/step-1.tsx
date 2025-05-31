"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormData, Isteps } from "./@types";
import { useState } from "react";

// Email Regex: No consecutive dots, must be valid domain, etc.
const emailRegex = /^(?!.*\.\.)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

// International phone number regex: allows + and 10-15 digits
const phoneRegex = /^(\+?\d{10,15})$/;

const Schema = object({
  full_name: string()
    .required("Full name is required")
    .test(
      "not-blank",
      "Full name cannot be blank or only spaces",
      value => !!value && value.trim().length > 0
    ),
  email: string()
    .required("Email is required")
    .test(
      "valid-email",
      "Enter a valid email address",
      value => {
        if (!value) return false;
        const trimmed = value.trim();
        return emailRegex.test(trimmed);
      }
    )
    .test(
      "no-consecutive-dots-email",
      "Emails cannot contain consecutive dots",
      value => {
        if (!value) return true;
        return !/\.{2,}/.test(value);
      }
    ),
  phone: string()
    .required("Phone number is required")
    .test(
      "valid-phone",
      "Enter a valid phone number (10-15 digits, + allowed)",
      value => {
        if (!value) return false;
        const trimmed = value.trim();
        return phoneRegex.test(trimmed);
      }
    )
});

interface Inputs {
  full_name: string;
  email: string;
  phone: string;
}

interface IStepOneProps extends Isteps {
  updateFormData: (data: FormData) => void;
}

const StepOne: React.FC<IStepOneProps> = ({ setStep, updateFormData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/trial-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          name: data.full_name
        }),
      });

      const result = await response.json();

      if (response.ok && result.otpId) {
        // Store data in sessionStorage for next step
        sessionStorage.setItem('otpId', result.otpId);
        sessionStorage.setItem('otpEmail', data.email);
        sessionStorage.setItem('userName', data.full_name);
        sessionStorage.setItem('userPhone', data.phone);
        
        // Update form data
        updateFormData(data as unknown as FormData);
        
        // Navigate to next step
        setStep(prev => prev + 1);
      } else {
        setError(result.message || 'Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Network error. Please try again.');
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
          Enter your information.
        </h2>
        <p className='tracking-wide text-base w-full'>
         Please fill out your details correctly for the best experience.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className='w-full flex flex-col gap-3'>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Full name</label>
          <input
            {...register("full_name")}
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.full_name ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter your full name'
            disabled={isLoading}
            required
          />
          {errors.full_name && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.full_name.message}
            </p>
          )}
        </div>
        
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Email</label>
          <input
            {...register("email")}
            type="email"
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.email ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter your email address'
            disabled={isLoading}
            required
          />
          {errors.email && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Phone Number</label>
          <input
            {...register("phone")}
            type="tel"
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.phone ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter your phone number'
            disabled={isLoading}
            required
          />
          {errors.phone && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Next button */}
        <div className='mt-4 flex items-center'>
          <button
            disabled={!!Object.keys(errors)?.length || isLoading}
            type='submit'
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed'
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Next Step</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepOne;