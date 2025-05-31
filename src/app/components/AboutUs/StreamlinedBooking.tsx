import Image from "next/image";
import React from "react";

const StreamlinedBooking = () => {
  return (
    <div className='w-full md:px-14 px-8 md:py-20 py-14 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-bgSecondary'>
      <div className='md:w-[45%] h-96 w-full flex items-center justify-center relative overflow-hidden rounded-[2rem]'>
        <Image
          src='/AboutUsImg1.svg'
          alt='DesignPlacement'
          fill
          className='object-contain'
        />
      </div>
      <div className='md:w-[55%] w-full flex flex-col md:pl-4 gap-2'>
        <h2 className='text-4xl font-bold tracking-wide'>
          Streamlined Tattoo
          <br />
          Booking
        </h2>
        <p className='mt-2 text-base tracking-wide leading-normal'>
          Artists working in a tattoo studio: the problems we have as artists
          trying to tattoo and maintain bookings can be hard, we spend many
          hours going back and forth qualifying leads and potential customers
          but now with the Pric&apos;d app, you can just focus on tattooing and the
          art.
        </p>
      </div>
    </div>
  );
};

export default StreamlinedBooking;
