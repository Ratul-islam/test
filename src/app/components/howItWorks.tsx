"use client";
import HowItWorkItem from "./howItWorkItem";

const HowItWorks = () => {
  const textHover =
    "Caption & vignette on mouse hover - Lorem ipsum dolor sit amet";

  return (
    <div className='flex gap-x-[11px] mobile:gap-x-[6px]'>
      <div className='flex flex-col gap-y-[11px] mobile:gap-y-[6px]'>
        {/* <Image src='/work1.png' width={586} height={627} alt='work1' /> */}
        <HowItWorkItem
          src='/ins_one.png'
          width={586}
          height={627}
          textHover={textHover}
        />
        <HowItWorkItem
          src='/ins_two.png'
          width={586}
          height={863}
          textHover={textHover}
        />
        <HowItWorkItem
          src='/ins_eight.png'
          width={586}
          height={316}
          textHover={textHover}
        />
      </div>

      <div className='flex flex-col gap-y-[11px] mobile:gap-y-[6px]'>
        <div className='flex gap-x-[11px] mobile:gap-x-[6px]'>
          <div className='flex flex-col gap-y-[11px] mobile:gap-y-[6px] mt-16'>
            <HowItWorkItem
              src='/ins_four.png'
              width={585}
              height={442}
              textHover={textHover}
            />
            <HowItWorkItem
              src='/ins_five.png'
              width={585}
              height={790}
              textHover={textHover}
            />
            <HowItWorkItem
              src='/ins_three.png'
              width={586}
              height={316}
              textHover={textHover}
            />
          </div>
          <div className='flex flex-col gap-y-[11px] mobile:gap-y-[11px]'>
            <HowItWorkItem
              src='/ins_six.png'
              width={586}
              height={948}
              textHover={textHover}
            />
            <HowItWorkItem
              src='/ins_seven.png'
              width={586}
              height={316}
              textHover={textHover}
            />
          </div>
        </div>

        <div></div>
      </div>
    </div>
  );
};

export default HowItWorks;
