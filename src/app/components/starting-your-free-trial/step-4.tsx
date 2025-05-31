"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormData, Isteps } from "./@types";

const Schema = object({
  instagram: string().required("Instagram is required"),
  tikTok: string().required("Tik tok is required"),
  facebook: string().required("Facebook is required")
});

interface Inputs {
  instagram: string;
  tikTok: string;
  facebook: string;
}

interface IStepFourProps extends Isteps {
  updateFormData?: (data: FormData) => void;
}

const StepFour: React.FC<IStepFourProps> = ({ setStep, updateFormData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur"
  });

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (updateFormData) updateFormData(data as unknown as FormData);
    setStep(prev => prev + 1);
  };
  return (
    <form
      className='w-full flex flex-col gap-5'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Connect your socials.
        </h2>
        <p className='tracking-wide text-base w-full'>
          Stay connected by adding links to your online presence, these will also be shared on your profile in the app.
        </p>
      </div>
      <div className='w-full flex flex-col gap-3'>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Instagram</label>
          <input
            {...register("instagram")}
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.instagram ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter username or url'
            required
          />
          {errors.instagram && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.instagram.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Tik tok</label>
          <input
            {...register("tikTok")}
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.tikTok ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter your Tik Tok username'
            required
          />
          {errors.tikTok && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.tikTok.message}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-y-2 relative'>
          <label className='text-xl tracking-wide'>Facebook</label>
          <input
            {...register("facebook")}
            className={`w-full px-3 py-3 rounded-lg border 
                ${errors.facebook ? "border-red-700" : "border-borderColor"}
                `}
            placeholder='Enter your Facebook username'
            required
          />
          {errors.facebook && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.facebook.message}
            </p>
          )}
        </div>
        <div className='mt-4 flex items-center gap-2'>
          <button
            disabled={!!Object.keys(errors)?.length}
            type='submit'
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300'
          >
            <span>Next Step</span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStep(prev => prev - 1);
            }}
            className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-transparent text-black rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-borderColor'
          >
            Go Back
          </button>
        </div>
      </div>
    </form>
  );
};

export default StepFour;