import Image from "next/image";
import React from "react";

const GetTrial = () => {
  return (
    <div className='w-full md:h-80 h-[45rem] md:px-14 px-8 md:py-20 py-14 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-[#DEF1FF] relative'>
      <div className='w-full h-full absolute top-0 left-0 z-0'>
        <div className='w-full h-full relative'>
          <Image
            src='/BlackDot.svg'
            alt='Black Dots'
            fill
            className='object-cover'
          />
        </div>
      </div>
      <div className='md:w-[70%] w-full flex flex-col gap-2 z-10'>
        <h2 className='text-2xl font-bold tracking-wide'>
          Sign up now{" "}
          <span className='relative p-1'>
            <Image
              src='heroHeadingTatoo.svg'
              fill
              alt='heroHeadingTatoo'
              className='z-0 absolute top-0 md:-left-1 left-0'
            />
           PRIC’D
          </span>{" "}
          free trial, save hours going back and forth. Save money paying
          receptionists. Get 80% higher sales , whilst customers are hot and
          want to book in their ideas, take the deposit! Try &quot;PRIC&apos;D” today
          and focus on the art.
        </h2>

        <div className='flex items-center gap-2'>
    <a href='sign-up'>
        <button className='px-3 py-1 rounded-xl text-black text-sm bg-white cursor-pointer'>
            Start now, sign up
        </button>
    </a>
</div>
      </div>
      <div className='md:w-[30%] w-full h-full flex items-center justify-center relative'>
        <Image
          src='/TatooMachine.svg'
          alt='TatooMachine'
          fill
          className='object-contain object-center'
        />
      </div>
    </div>
  );
};

export default GetTrial;
