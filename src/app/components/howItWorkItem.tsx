"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface props {
  width: number;
  height: number;
  src: string;
  textHover?: string;
}

const HowItWorkItem: React.FC<props> = ({ width, height, src, textHover }) => {
  const path = usePathname();
  return (
    <div className='relative group'>
      <Image
        className={`${path !== "/" ? "filter hover:brightness-[75%] duration-300" : ""}`}
        width={width}
        height={height}
        src={src}
        alt={src}
      />
      {path !== "/" ? (
        <span
          className='absolute bottom-[-20px] left-5 invisible transition-all  duration-500 text-[28px] text-white leading-[100%]
        mobile:text-[8px] mobile:left-1 mobile:group-hover:bottom-1
        tablet:text-[10px] tablet:left-2 tablet:group-hover:bottom-2
        laptop:text-[16px]
        xl:text-[24px]
        group-hover:bottom-5 group-hover:visible
      '
        >
          {textHover}
        </span>
      ) : null}
    </div>
  );
};

export default HowItWorkItem;
