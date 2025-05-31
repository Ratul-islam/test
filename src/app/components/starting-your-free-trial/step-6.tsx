"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { disableScroll } from "@/app/utils/scrollbar";

interface props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const Schema = object({
  goal: string()
    .required("gaol is required")
    .min(2, "Must be not shorter than 2 characters"),
  invest: string().required("invest is required"),
  description: string()
});

interface Inputs {
  goal: string;
  invest: string;
  descriptiom?: string;
}

const StepSix: React.FC<props> = ({ setShowModal }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  const onSubmit: SubmitHandler<Inputs> = () => {
    disableScroll();
    setShowModal(true);
  };

  return (
    <form className='mt-[30px]' onSubmit={handleSubmit(onSubmit)}>
      <h2 className='text-[80px] laptop:text-[40px] mobile:text-[28px] leading-[100%] mb-4 mt-14'>
        Goals & Preferences
      </h2>
      <p className='text-[21px] mt-1 leading-[180%] max-w-[700px] laptop:text-[16px]'>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry&apos;s standard
      </p>
      <div className='mt-[30px] flex flex-col gap-y-5 max-w-[860px] laptop:gap-y-10 laptop:mt-5'>
        <div className='flex flex-col gap-y-2 relative'>
          <label className='text-[26px] laptop:text-[18px] mobile:text-[16px]'>
            What’s your primary goal or motivation for joining?
          </label>
          <input
            {...register("goal")}
            className={`w-full h-[58px] p-[10px] text-[24px] focus:outline-0 max-w-[860px] shadow-md  border-2
                ${errors.goal ? "border-red-700 border-2" : "border"}
                `}
            placeholder='Enter your primary goal'
            required
          />
          {errors.goal && (
            <p className='text-red-500 absolute bottom-[-40px] right-0  text-[20px] laptop:text-[16px] mobile:bottom-[-30px]'>
              {errors.goal.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-y-2 relative'>
          <label className='text-[26px] laptop:text-[18px] mobile:text-[16px]'>
            How much would you be willing to invest in this?
          </label>
          <input
            {...register("invest")}
            className={`w-full h-[58px] p-[10px] text-[24px] focus:outline-0 max-w-[860px] shadow-md  border-2
                ${errors.invest ? "border-red-700 border-2" : "border"}
                `}
            placeholder='Enter value'
            required
          />
          {errors.invest && (
            <p className='text-red-500 absolute bottom-[-40px] right-0 text-[20px] laptop:text-[16px] mobile:bottom-[-30px]'>
              {errors.invest.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-y-2 relative'>
          <label className='text-[26px] laptop:text-[18px] mobile:text-[16px]'>
            If this didn’t exist, what would you try instead?
          </label>
          <textarea
            {...register("descriptiom")}
            className={`w-full h-[120px] p-[18px] resize-none text-[24px] border focus:outline-0 max-w-[860px] shadow-md
                ${errors.descriptiom ? "border-red-700 border-2" : "border"}
                `}
            placeholder='Write your description here....'
          />
          <span className='absolute right-2 bottom-2 text-[#999]'>
            {watch("descriptiom")?.length
              ? `${watch("descriptiom")?.length} / 500`
              : "0 / 500"}
          </span>
          {errors.descriptiom && (
            <p className='text-red-500 absolute bottom-[-40px] right-0  text-[20px]'>
              {errors.descriptiom.message}
            </p>
          )}
        </div>
        <button
          disabled={!!Object.keys(errors)?.length}
          type='submit'
          className='h-[95px] gap-x-1 max-w-[440px] w-full text-white bg-black text-[26px] rounded-[57px] tracking-wide
         mt-[40px] xl:mt-[70px] mx-auto flex justify-center items-center group
         tablet:h-20 disabled:bg-[#999]
         mobile:mt-5 mobile:h-16 mobile:text-[22px]
         '
        >
          SUBMIT
        </button>
      </div>
    </form>
  );
};

export default StepSix;
