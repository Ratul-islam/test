import Image from "next/image";
import React from "react";

const EffortLessBooking = () => {
  return (
    <div className='w-full md:px-14 px-8 md:py-20 py-14 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-bgPrimary2'>
      <div className='md:w-[55%] w-full flex flex-col gap-2'>
        <h2 className='text-4xl font-bold tracking-wide'>
        Trusted booking App
        </h2>
        <p className='mt-2 text-base tracking-wide leading-normal'>
        The easy booking app, understanding your clients without having to ask the questions or trying to see what days they are available or trying to understand their budgets, clients simply upload the design and scale up or down to suite their budgets.
        </p>
      </div>
      <div className='md:w-[45%] h-96 w-full flex items-center justify-center relative overflow-hidden rounded-[2rem]'>
        <Image
          src='/AboutUsImg2.svg'
          alt='DesignPlacement'
          fill
          className='object-contain'
        />
      </div>
    </div>
  );
};

export default EffortLessBooking;
