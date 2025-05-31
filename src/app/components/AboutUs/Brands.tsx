import Image from "next/image";
import React from "react";

const Brands = () => {
  return (
    <div className='w-full md:px-14 px-8 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-[#f7f8fa]'>
      <div className='md:w-[80%] w-full md:h-80 h-60 flex items-center justify-center relative'>
        <Image
          src='/brands.png'
          alt='DesignPlacement'
          fill
          className='object-contain'
        />
      </div>
    </div>
  );
};

export default Brands;
