import Image from "next/image";
import React from "react";

const ViewInspiration = () => {
  return (
    <section className='w-full md:px-14 px-8 md:py-20 py-14 flex flex-col gap-3 items-center justify-center bg-bgPrimary2'>
      <h1 className='font-bold text-5xl text-center tracking-wide'>
        View Inspirations.
      </h1>
      <p className='text-center tracking-wide text-base md:w-[25%] w-full'>
        View Latest inspiration that is created by our customers.
      </p>
      <div className='flex items-center gap-2'>
        <a href="/inspirations">
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer '>
          Browse Inspirations
        </button>
        </a>
        <a href="/starting-your-free-trial">
        <button className='px-3 py-1 rounded-xl text-black text-base bg-white cursor-pointer '>
          Get a Free Demo
        </button>
        </a>
      </div>
      <div className='w-full flex items-end justify-center flex-wrap gap-5 mt-8'>
        <div className='w-36 h-48 relative rounded-xl overflow-hidden'>
          <Image
            src='/Inspiration1.png'
            fill
            alt='Inspiration'
            className='object-cover'
          />
        </div>
        <div className='w-36 h-44 relative rounded-xl overflow-hidden'>
          <Image
            src='/Inspiration2.png'
            fill
            alt='Inspiration'
            className='object-cover'
          />
        </div>
        <div className='w-36 h-40 relative rounded-xl overflow-hidden'>
          <Image
            src='/Inspiration3.png'
            fill
            alt='Inspiration'
            className='object-cover'
          />
        </div>
        <div className='w-36 h-44 relative rounded-xl overflow-hidden'>
          <Image
            src='/Inspiration4.png'
            fill
            alt='Inspiration'
            className='object-cover'
          />
        </div>
        <div className='w-36 h-48 relative rounded-xl overflow-hidden'>
          <Image
            src='/Inspiration5.png'
            fill
            alt='Inspiration'
            className='object-cover'
          />
        </div>
      </div>
    </section>
  );
};

export default ViewInspiration;
