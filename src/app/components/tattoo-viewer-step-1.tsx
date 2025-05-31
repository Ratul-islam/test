"use client";

import React from "react";
import { useGender } from "@/app/contexts/GenderContext";
import Image from "next/image";

const TattooViewerStep1 = () => {
  const { genderIndex, setGenderIndex } = useGender();

  return (
    <div className='w-full flex flex-col gap-5'>
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Select your gender
          <br />
          to get started.
        </h2>

        <p className='tracking-wide text-base w-full'>
          Please answer the questions accurately to receive a precise quote.

        </p>
      </div>

      {/* Gender Options */}

      <div className='flex md:flex-row flex-col md:gap-0 gap-2 items-center justify-between w-full'>
        {/* Male Option */}
        <div
          onClick={() => {
            setGenderIndex(0);
          }}
          className={`relative h-40 md:w-[49%] w-full border ${genderIndex == 0 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='gender'
            checked={genderIndex === 0}
            id='male'
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='male'
            className='flex items-end justify-between w-full h-full cursor-pointer text-white bg-black'
          >
            <span className='font-medium text-xl pl-2 pb-2'>Male</span>
            <div className='w-[70%] h-full flex items-end justify-end relative'>
              <Image
                src='/male.png'
                alt='Male'
                fill
                className='object-cover object-top'
              />
            </div>
          </label>

        </div>

        {/* Female Option */}
        <div
          onClick={() => {
            setGenderIndex(1);
          }}
          className={`relative h-40 md:w-[49%] w-full border ${genderIndex == 1 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='gender'
            checked={genderIndex === 1}
            id='female'
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='female'
            className='flex items-end justify-between w-full h-full cursor-pointer text-black bg-white'
          >
            <span className='font-medium text-xl pl-2 pb-2'>Female</span>
            <div className='w-[70%] h-full flex items-end justify-end relative'>
              <Image
                src='/female.png'
                alt='Male'
                fill
                className='object-cover object-top scale-x-[-1]'
              />
            </div>
          </label>
        </div>
        {/* <div className='flex flex-col items-center'>
          <button
            onClick={() => setGenderIndex(1)}
            className={`w-[100px] h-[100px] xl:w-[150px] xl:h-[150px] rounded-full bg-gray-200 flex items-center justify-center 
              transition-all duration-300 hover:scale-105 relative
              ${genderIndex === 1 ? 
                "ring-4 ring-green-400 ring-inset shadow-lg shadow-green-100" : 
                "hover:ring-2 hover:ring-gray-300"}`}
          >
            <div className={`absolute inset-0 rounded-full border-2 
              ${genderIndex === 1 ? "border-green-400" : "border-transparent"}
              transition-colors duration-300`} />
            <Image
              src='/female.png'
              alt='Female'
              width={50}
              height={50}
              className='w-[50px] xl:w-[75px] transition-transform duration-300'
            />
          </button>
          <span className='mt-[10px] text-[16px] xl:text-[18px]'>Female</span>
        </div> */}
      </div>
    </div>
  );
};

export default TattooViewerStep1;