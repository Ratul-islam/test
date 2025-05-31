import Image from "next/image";
import React from "react";

const DesignPlacement = () => {
  return (
    <div className='w-full md:px-14 px-8 md:py-20 py-14 flex md:flex-row flex-col gap-2 md:gap-0 items-center justify-center bg-bgSecondary'>
      <div className='md:w-[45%] h-96 w-full flex items-center justify-center relative overflow-hidden rounded-[2rem]'>
        <Image
          src='/threeDModel.png'
          alt='DesignPlacement'
         fill
          className='object-contain'
        />
      </div>
      <div className='md:w-[55%] w-full flex flex-col md:pl-4 gap-2'>
        <h2 className='text-4xl font-bold tracking-wide'>
          3D Design Placement:
          <br />
          Visualize Before You <br /> Commit
        </h2>
        <p className='mt-2 text-base tracking-wide leading-normal'>
          &quot;Visualize tattoos with our 3D tool. Upload your design or choose
          a spot to see how it&apos;ll look before booking.&quot;
        </p>
        <div className='flex items-center gap-2'>
    <a href='tattoo-viewer'>
        <button className='px-3 py-1 rounded-xl text-white text-base bg-black cursor-pointer'>
            Try the 3-D Model
        </button>
    </a>
</div>
      </div>
    </div>
  );
};

export default DesignPlacement;
