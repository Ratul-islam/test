/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import { Isteps } from "./@types";
import { ChangeEvent, useState } from "react";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

// Email validation schema
const emailSchema = yup.object().shape({
  email: yup.string().email("Please enter a valid email").required("Email is required"),
});

const StepZero: React.FC<Isteps> = ({ setStep }) => {
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { register, setValue, getValues, formState: { errors } } = useFormContext();

  const validateEmail = async (email: string) => {
    try {
      await emailSchema.validateAt('email', { email });
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleNextStep = async () => {
    setError("");
    const { name, email, phone, password } = getValues();
    
    // Check all required fields
    if (!name || !email || !phone || !password) {
      return setError("All fields are required");
    }

    // Validate email format
    const isEmailValid = await validateEmail(email);
    if (!isEmailValid) {
      return setError("Please enter a valid email address");
    }

    // If everything is valid, proceed to next step
    setStep(prev => prev + 1);
  };

  return (
    <>
      {/* --------Name ------ */}
      <div>
        <label className='text-[14px] font-medium'>Name</label>
        <input
          {...register("name", { required: true })}
          placeholder='Enter name'
          className={`h-12 p-2 max-w-[555px] w-full border-[0.5px] ${
            errors.name ? "border-red-500" : "border-[#e5e5e5]"
          } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
        />
        {errors.name && (
          <p className='text-red-500 text-sm'>Name is required</p>
        )}
      </div>

      {/* --------Email ------ */}
      <div>
        <label className='text-[14px] font-medium'>Email</label>
        <input
          {...register("email", { 
            required: true,
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address"
            }
          })}
          placeholder='Enter email address'
          className={`h-12 p-2 max-w-[555px] w-full border-[0.5px] ${
            errors.email ? "border-red-500" : "border-[#e5e5e5]"
          } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
        />
        {errors.email && (
          <p className='text-red-500 text-sm'>
            {errors.email.message?.toString() || "Email is required"}
          </p>
        )}
      </div>

      {/* --------Phone ------ */}
      <div>
        <label className='text-[14px] font-medium'>Phone</label>
        <input
          {...register("phone", { required: true })}
          placeholder='Enter phone number'
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const cleanedValue = e.target.value
              .replace(/[^0-9]/g, "")
              .slice(0, 20);
            setValue("phone", cleanedValue);
          }}
          className={`h-12 p-2 max-w-[555px] w-full border-[0.5px] ${
            errors.phone ? "border-red-500" : "border-[#e5e5e5]"
          } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
        />
        {errors.phone && (
          <p className='text-red-500 text-sm'>Phone number is required</p>
        )}
      </div>

      {/* ----------- Password ------- */}
      <div className='relative'>
        <label className='text-[14px] font-medium'>Password</label>
        <input
          {...register("password", { required: true })}
          placeholder='Enter password'
          type={showPassword ? "text" : "password"}
          className={`h-12 p-2 max-w-[555px] w-full border-[0.5px] ${
            errors.password ? "border-red-500" : "border-[#e5e5e5]"
          } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
        />
        <button
          type='button'
          className='absolute top-9 right-4'
          onClick={() => setShowPassword(prev => !prev)}
        >
          <Image
            src={showPassword ? "/hide-password.svg" : "/show-password.svg"}
            height={24}
            width={24}
            alt='show'
          />
        </button>
        {errors.password && (
          <p className='text-red-500 text-sm'>Password is required</p>
        )}
      </div>

      {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}

      <div className='text-center'>
        <button
          type='button'
          onClick={handleNextStep}
          className='gap-x-1 text-white bg-black text-[26px] rounded-[57px] tracking-wide
          mt-[170px] xl:mt-[70px] mx-auto flex justify-center items-center group
          disabled:bg-[#999] px-12 py-4'
        >
          Sign up!
          <Image
            src='/arrow-right-btn.svg'
            height={30}
            width={30}
            alt='arrow'
            className={`group-hover:translate-x-8 duration-200`}
          />
        </button>
      </div>
    </>
  );
};

export default StepZero;