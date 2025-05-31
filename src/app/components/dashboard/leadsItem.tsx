"use client";
import Image from "next/image";

interface props {
  image: string;
  name: string;
  date: string;
}

const LeadItem: React.FC<props> = ({ image, name, date }) => {
  return (
    <div className='w-full max-w-[335px] xl:max-w-full h-[41px] flex items-center gap-x-2 justify-between xl:w-full'>
      <div className='flex gap-x-3 mobile:items-center'>
        <div>
          <Image
            src={image}
            height={41}
            width={41}
            className='mobile:h-8 mobile:w-8'
            alt='avatar'
          />
        </div>
        <div>
          <span className='font-semibold font-inter mobile:text-[14px]'>
            {name}
          </span>
          <p className='flex gap-x-2 items-center mobile:text-[12px]'>
            <Image
              src='/dashboard/time-blue.svg'
              height={16}
              width={16}
              alt='time'
            />{" "}
            {date}
          </p>
        </div>
      </div>
      <button className='rounded-[8px] font-second font-bold w-[99px] h-[30px] py-[6px] px-[10px] text-[10px] mobile:w-fit mobile:text-[9px] shadow-md'>
        View Design
      </button>
    </div>
  );
};

export default LeadItem;
