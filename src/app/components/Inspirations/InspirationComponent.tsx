import Image from "next/image";
import React from "react";
import { MdArrowOutward } from "react-icons/md";

const InspirationComponent = () => {
  return (
    <div className='w-full flex md:flex-row flex-col-reverse md:gap-0 gap-4 relative z-30'>
      <div className='md:w-[40%] w-full md:pl-14 pl-8 flex flex-col md:mt-36 gap-3'>
        <button className='rounded-3xl bg-white w-fit flex items-center gap-1 px-1 py-1 border border-borderColor'>
          <span className='ml-1 text-sm tracking-wide'>
            Inspiration Section
          </span>
          <Image
            src='/InspirationsImgG.svg'
            height={70}
            width={70}
            alt='Inspirations'
            className=''
          />
        </button>
        <h1 className='font-bold md:text-7xl text-5xl tracking-wide'>Inspirations</h1>
        <p className='tracking-wide text-base'>
          See what recent customers created using our app
        </p>
        <button className='px-3 py-1 rounded-md text-white flex items-center gap-2 text-base bg-black cursor-pointer w-fit'>
          View All Inspirations
          <MdArrowOutward />
        </button>
      </div>
      <div className='md:w-[60%] w-full md:h-[90vh] h-[60vh] flex items-center justify-center relative'>
        <Image
          src='InspirationsImg.svg'
          fill
          alt='Inspirations'
          className='object-cover'
        />
      </div>
    </div>
  );
};

export default InspirationComponent;
