import React from "react";

const Support = () => {
  return (
    <section className='w-full md:px-14 px-8 md:py-20 py-14 flex flex-col gap-3 items-center justify-center bg-bgPrimary2'>
      <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
        Support Team
      </h1>
      <p className='text-center tracking-wide text-base md:w-[45%] w-full'>
        If you need any assistance, feel free to reach out to our support team
        by clicking the button below:
      </p>
      <div className='flex items-center gap-2'>
        <a href="/contact-us">
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer '>
          Contact Support
        </button>
        </a>
      </div>
    </section>
  );
};

export default Support;
