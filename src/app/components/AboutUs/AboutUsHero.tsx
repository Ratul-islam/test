import Image from "next/image";
import React from "react";
import { FaCaretRight } from "react-icons/fa6";

const AboutUsHero = () => {
  return (
    <div className='w-full md:px-14 px-8 md:py-20 py-14 flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-yellow-100 to-blue-100 relative'>
      <button className='rounded-lg bg-gradient-to-br from-[#71D5FF] to-[#70A9FF] flex items-center justify-center gap-2 px-2 py-1 z-30'>
        <span className='text-sm tracking-wide font-semibold'>
          About PRIC’D
        </span>
        <FaCaretRight className='text-sm tracking-wide' />
      </button>
      <div className='flex items-center justify-center z-30'>
        <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
          About Us
        </h1>
      </div>
      <p className='text-center tracking-wide text-base md:w-[75%] w-full z-30'>
        At Pric’d, we believe tattoo artists should spend more time creating art
        and less time stuck in admin. Built by artists for artists, our app was
        designed to make the quoting and booking process effortless. By
        combining cutting-edge 3D modeling technology with a deep understanding
        of the tattoo industry, we’ve created a solution that empowers artists
        to run smoother, faster, and more professional businesses — all while
        giving clients a better, more transparent experience.
      </p>
      <div className='flex items-center justify-end gap-2 z-30'>
    <a href='starting-your-free-trial'>
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer'>
            Try Booking Form
        </button>
    </a>
    {/* <a href='dashboard'>
        <button className='px-3 py-1 rounded-xl text-black text-base bg-white cursor-pointer'>
            View Artist Dashboard
        </button>
    </a> */}
</div>
      <div className='md:w-1/2 w-full flex items-center justify-center mt-8 z-30'>
        <Image
          src='/AboutUsImage.svg'
          alt='aboutUs'
          height={500}
          width={500}
          className='object-contain'
        />
      </div>
      <div className='w-full py-20 bg-white shadow-3xl shadow-white absolute z-0 bottom-[20%] left-0 blur-2xl' />
    </div>
  );
};

export default AboutUsHero;
