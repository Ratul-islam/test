"use client";

import Image from "next/image";

const AboutUsComponent = () => {
  return (
    <div className='w-full md:px-14 px-8 py-2 bg-bgPrimary2'>
      <div className='md:py-20 py-14 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-bgSecondary relative z-30'>
        <div className='md:w-1/2 w-full md:pr-5 md:pl-8 flex flex-col gap-2'>
          <h2 className='text-4xl font-bold tracking-wide'>About Us</h2>
          <p className='mt-2 text-base tracking-wide leading-normal'>
            At Pric’d, we believe tattoo artists should spend more time creating
            art and less time stuck in admin. Built by artists for artists, our
            app was designed to make the quoting and booking process effortless.
            By combining cutting-edge 3D modeling technology with a deep
            understanding of the tattoo industry, we’ve created a solution that
            empowers artists to run smoother, faster, and more professional
            businesses — all while giving clients a better, more transparent
            experience.
          </p>
          <div className='flex items-center gap-2'>
    <a href='tattoo-viewer'>
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer'>
            Client Experience
        </button>
    </a>
</div>
        </div>
        <div className='md:w-[45%] h-96 w-full flex items-center justify-center relative overflow-hidden rounded-[2rem]'>
          <Image
            src='/demo.gif'
            alt='DesignPlacement'
            fill
            className='object-contain'
          />
        </div>
      </div>
    </div>
  );
};

export default AboutUsComponent;
