"use client";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import { Isteps } from "./@types";
import { useState } from "react";

const StepZero: React.FC<Isteps> = ({ setStep }) => {
  const { handleSubmit } = useForm();

  const [charSelected, setCharSelected] = useState<"artist" | "studio">();

  const onSubmit: SubmitHandler<FieldValues> = () => setStep(prev => prev + 1);

  return (
    <form className='mt-[30px]' onSubmit={handleSubmit(onSubmit)}>
      <h2 className='text-[80px] laptop:text-[40px] mobile:text-[28px]'>
        Are you an Artist or a Studio?
      </h2>
      <p className='text-[21px] mt-1 leading-[180%] max-w-[700px] laptop:text-[18px]'>
        Here are the steps to get you onto the journey of using our app.
      </p>
      <div
        className='mt-[60px] flex flex-col gap-y-5 max-w-[860px]
      laptop:gap-y-2 laptop:mt-5
      '
      >
        <div className='flex items-center justify-center md:justify-start gap-3'>
          <div>
            <span
              onClick={() => setCharSelected("artist")}
              className={`rounded-full ${charSelected == "artist" ? "bg-gray-300" : "bg-gray-200"} cursor-pointer h-36 w-36 grid place-items-center hover:bg-gray-300 duration-300`}
            >
              <Image src='/dude1.png' height={80} width={80} alt='arrow' />
            </span>
            <h6 className='text-center text-2xl mt-3'>Artist</h6>
          </div>
          <div>
            <span
              onClick={() => setCharSelected("studio")}
              className={`rounded-full ${charSelected == "studio" ? "bg-gray-300" : "bg-gray-200"} cursor-pointer h-36 w-36 grid place-items-center hover:bg-gray-300 duration-300`}
            >
              <Image
                src='/tattoo_shop.jpg'
                height={80}
                width={80}
                alt='arrow'
              />
            </span>
            <h6 className='text-center text-2xl mt-3'>Studio</h6>
          </div>
        </div>
        <button
          disabled={!charSelected}
          type='submit'
          className='h-[95px] gap-x-1 max-w-[440px] w-full text-white bg-black text-[26px] rounded-[57px] tracking-wide
         mt-[170px] xl:mt-[70px] mx-auto flex justify-center items-center group
         tablet:h-20 disabled:bg-[#999]
         mobile:mt-8 mobile:h-16 mobile:text-[22px]
         '
        >
          Next Step
          <Image
            src='/arrow-right-btn.svg'
            height={30}
            width={30}
            alt='arrow'
            className={`${charSelected ? "group-hover:translate-x-8 duration-200" : ""}`}
          />
        </button>
      </div>
    </form>
  );
};

export default StepZero;
