/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import React from "react";
import { FaCaretRight } from "react-icons/fa6";

const Hero = () => {
  return (
    <div className='w-full md:px-14 px-8 md:py-20 py-14 flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-yellow-100 to-blue-100 relative'>
      <button className='rounded-lg bg-gradient-to-br from-[#71D5FF] to-[#70A9FF] flex items-center justify-center gap-2 px-2 py-1 z-30'>
        <span className='text-sm tracking-wide font-semibold'>
          Instant Tattoo Pricing. Zero Admin.
        </span>
        <FaCaretRight className='text-sm tracking-wide' />
      </button>
      <div className='flex items-center justify-center z-30'>
        <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
          <span className='relative p-2'>
            <span className='relative z-30'>Instant</span>
            <Image
              src='heroHeadingTatoo.svg'
              fill
              alt='heroHeadingTatoo'
              className='z-0 absolute top-0 md:-left-1 left-0'
            />
          </span>
          Tattoo Pricing.
          <br />
          Zero Admin.
        </h1>
      </div>
      <p className='text-center tracking-wide text-base md:w-[60%] w-full z-30'>
        PRIC&apos;D is the smart tattoo estimate app that lets your clients
        upload their design, preview 3D model, get an accurate
        quote instantly — and book straight in. Spend more time tattooing, less
        time quoting.
      </p>
      <div className='flex items-center justify-end z-30'>
    <a href='starting-your-free-trial'>
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer'>
            Start 14 Days Free Trial
        </button>
    </a>
</div>
      <div className="relative w-[90%] aspect-[16/9] md:aspect-[16/9] max-h-[90vh] bg-transparent z-30 flex justify-center items-center rounded-2xl overflow-hidden border-4 border-[#f2f2f2] shadow-2xl shadow-[#f2f2f2]">        <Image
          src='/HeroImageMain.png'
          fill
          alt='heroMainImage'
          className='w-full h-full object-cover object-top'
        />
        <div className='w-full h-full bg-gradient-to-t from-bgPrimary to-transparent opacity-90 rounded-xl absolute bottom-0 left-0' />
      </div>
      <div className='w-full py-20 bg-gradient-to-b from-white to-bgPrimary2 absolute z-0 -bottom-8 left-0 blur-md shadow-3xl shadow-white' />
    </div>
  );
};

export default Hero;
