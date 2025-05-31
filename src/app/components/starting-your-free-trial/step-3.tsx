"use client";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { FormData, Isteps } from "./@types";

const Schema = object({
  studioOrArtist: string().required("Selection is required")
});

interface Inputs {
  studioOrArtist: string;
}

interface IStepThreeProps extends Isteps {
  updateFormData?: (data: FormData) => void;
}

const StepThree: React.FC<IStepThreeProps> = ({ setStep, updateFormData }) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(Schema),
    mode: "onBlur",
    defaultValues: {
      studioOrArtist: ""
    }
  });

  const selectedValue = watch("studioOrArtist");

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (updateFormData) updateFormData(data as unknown as FormData);
    setStep(prev => prev + 1);
  };

  const getConditionalText = () => {
    if (selectedValue === "artist") {
      return "If you are a tattoo artist you will have your own dashboard.";
    } else if (selectedValue === "tatooStudio") {
      return "If you are a tattoo studio you will have your own dashboard.";
    }
    return "";
  };

  return (
    <form
      className='w-full flex flex-col gap-5'
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Are you an artist or <br />a tattoo studio?
        </h2>
        <p className='tracking-wide text-base w-full'>
          {getConditionalText() || ""}
        </p>
      </div>
      <div className='w-full flex flex-col gap-3'>
        <div className='flex flex-col gap-2 relative'>
          <label className='text-xl tracking-wide'>Are you artist or tattoo studio ?</label>

          <select
            {...register("studioOrArtist")}
            onChange={e =>
              setValue("studioOrArtist", e.target.value, {
                shouldValidate: true
              })
            }
            className={`w-full px-3 py-3 rounded-lg border
                ${errors.studioOrArtist ? "border-red-700" : "border-borderColor"}
                `}
          >
            <option value=''>Select an option</option>
            <option value='artist'>
              Artist
            </option>
            <option value='tatooStudio'>
              Tattoo Studio
            </option>
          </select>
          {errors.studioOrArtist && (
            <p className='text-red-500 absolute -bottom-5 right-0 text-xs'>
              {errors.studioOrArtist.message}
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

export default StepThree;