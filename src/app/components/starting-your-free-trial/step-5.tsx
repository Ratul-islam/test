"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useState } from "react";
import { FormData } from "./@types";

const Schema = object({
  description: string()
});

interface Inputs {
  description?: string;
}

interface WelcomeEmailData {
  email: string;
  name: string;
  description?: string;
  social: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
  userType?: string;
}

interface props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
  updateFormData?: (data: FormData) => void;
}

const StepFive: React.FC<props> = ({ setShowModal, setStep, updateFormData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    setEmailError(null);
    
    try {
      if (updateFormData) updateFormData(data as unknown as FormData);
      
      // Get stored form data
      const formData = JSON.parse(localStorage.getItem('freeTrialData') || '{}');
      
      // Send welcome videos email
      const response = await fetch('/api/send-welcome-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.full_name,
          description: data.description,
          social: {
            instagram: formData.instagram,
            tiktok: formData.tikTok,
            facebook: formData.facebook
          },
          userType: formData.studioOrArtist
        } as WelcomeEmailData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send welcome email');
      }
      
      // Show success modal
      setShowModal(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setEmailError(error instanceof Error ? error.message : 'Failed to send welcome email');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className='w-full flex flex-col gap-5'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Why are you joining our community?
        </h2>
        <p className='tracking-wide text-base w-full'>
          Let us know why you have chosen to join us, your feedback is appriciated and will help us improve  our services.
        </p>
      </div>
      <div className='w-full flex flex-col gap-3'>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>
            Tell us about yourself and why you&apos;d like to join our
            community?
          </label>
          <textarea
            {...register("description")}
            rows={5}
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.description ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Write your description here....'
          />
          <span className='absolute right-2 bottom-2 text-[#999]'>
            {watch("description")?.length
              ? `${watch("description")?.length} / 500`
              : "0 / 500"}
          </span>
          {errors.description && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.description.message}
            </p>
          )}
        </div>
        
        {emailError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-2">
            {emailError}
          </div>
        )}
        
        <div className='mt-4 flex items-center gap-2'>
          <button
            disabled={isSubmitting || !!Object.keys(errors)?.length}
            type='submit'
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500'
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <>
                <span>Complete</span>
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
          >
            Go Back
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepFive;