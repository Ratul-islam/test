/* eslint-disable @typescript-eslint/no-explicit-any */
import { useForm } from "react-hook-form";
import { enableScroll } from "@/app/utils/scrollbar";
import { ChangeEvent, useEffect, useState } from "react";
import { createOrUpdateArtist } from "@/app/services/artistService";

interface ArtistFormData {
  name: string;
  email: string;
  phone: string;
  specialization?: string;
  hourlyRate?: string;
  rates: {
    tiny?: string;
    small?: string;
    medium?: string;
    large?: string;
  };
}

const AddArtistForm = ({
  setShowModal,
  artist,
  allArtists
}: {
  setShowModal: (value: boolean) => void;
  artist: any;
  allArtists: any;
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ArtistFormData>();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    // Only populate form if artist has an id (we're editing)
    if (artist && artist.id) {
      Object.entries(artist).forEach(([key, value]) => {
        if (key === "rates" && typeof value === "object") {
          Object.entries(value as any).forEach(([rateKey, rateValue]) => {
            console.log("🚀 ~ Object.entries ~ rateValue:", rateValue);
            setValue(`${rateKey}` as keyof ArtistFormData, rateValue as string);
          });
        } else {
          setValue(key as keyof ArtistFormData, value as string);
        }
      });
    } else {
      // Clear form when adding a new artist
      // Reset all fields to empty
      setValue("name", "");
      setValue("email", "");
      setValue("phone", "");
      setValue("specialization", "");
      setValue("hourlyRate", "");
      
      // Clear all rate fields
      ["tiny", "small", "medium", "large", "xl", "xxl"].forEach(rate => {
        setValue(rate as keyof ArtistFormData, "");
      });
    }
  }, [artist, setValue]);

  const onSubmitHandler = async (data: any) => {
    try {
      setLoading(true);
      setServerError(null);
      
      // Format data for submission
      data.rates = {
        tiny: data.tiny ? Number(data.tiny) : null,
        small: data.small ? Number(data.small) : null,
        medium: data.medium ? Number(data.medium) : null,
        large: data.large ? Number(data.large) : null,
        xl: data.xl ? Number(data.xl) : null,
        xxl: data.xxl ? Number(data.xxl) : null
      };
      data.hourlyRate = data.hourlyRate ? Number(data.hourlyRate) : null;

      const res = await createOrUpdateArtist({
        body: data,
        id: artist?.id || null
      });
      
      setLoading(false);
      
      if (!res[1]) {
        allArtists();
        setShowModal(false);
        enableScroll();
      } else {
        // Handle server errors
        const errorData = res[1];
        if (errorData.message && errorData.message.includes("email already exists")) {
          setServerError("Email already exists. Please use a different email.");
        } else if (errorData.status === 409) {
          setServerError("An artist with this email already exists.");
        } else {
          setServerError("An error occurred. Please try again.");
        }
      }
    } catch (error: any) {
      setLoading(false);
      if (error.message && error.message.includes("email already exists")) {
        setServerError("Email already exists. Please use a different email.");
      } else {
        console.error("Error submitting form:", error);
        setServerError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className='flex flex-col gap-y-20 justify-between h-[calc(100dvh-27px)] w-[618px] bg-white rounded-[16px] m-[17px] p-6 overflow-y-auto tablet:m-0 tablet:w-screen tablet:h-screen'
    >
      <div>
        <div className='flex items-center gap-x-3 justify-between'>
          <span className='text-[32px] tracking-wider'>
            {artist?.id ? 'Edit Artist' : 'Add new Artist'}
          </span>
          <div
            className='p-1 hover:bg-black/40 duration-200 flex items-center justify-center rounded-[50%] cursor-pointer'
            onClick={() => {
              setShowModal(false);
              enableScroll();
            }}
          >
            {/* <Image
              src="/dashboard/close-modal.svg"
              width={32}
              height={32}
              alt="close"
              title="close modal"
            /> */}
          </div>
        </div>
        
        {/* Server-side error message display */}
        {serverError && (
          <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {serverError}
          </div>
        )}
        
        <div className='mt-3 flex flex-col gap-y-2'>
          {/* First Name */}
          <div className='flex flex-col gap-y-2 w-full'>
            <label className='text-[18px] font-semibold tracking-wider'>
              Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
            />
            {errors.name && (
              <span className='text-red-500'>{errors.name.message}</span>
            )}
          </div>

          {/* Email */}
          <div className='flex flex-col gap-y-2 w-full'>
            <label className='text-[18px] font-semibold tracking-wider'>
              Email
            </label>
            <input
              type='email'
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
            />
            {errors.email && (
              <span className='text-red-500'>{errors.email.message}</span>
            )}
          </div>

          {/* Phone */}
          <div className='flex flex-col gap-y-2 w-full'>
            <label className='text-[18px] font-semibold tracking-wider'>
              Phone
            </label>
          <input
                    {...register("phone", { required: true })}
                    
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const cleanedValue = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 20);
                      setValue("phone", cleanedValue);
                    }}
                    className={`h-12 p-2 max-w-[555px] text-[12px] w-full border-[0.5px] ${
                      errors.phone ? "border-red-500" : "border-[#e5e5e5]"
                    } bg-[#f2f2f2] rounded-[6px] focus:outline-none`}
                  />
                  {errors.phone && (
                    <p className='text-red-500 text-sm'>Phone number is required</p>
                  )}
            {errors.phone && (
              <span className='text-red-500'>{errors.phone.message}</span>
            )}
          </div>

          {/* Specialization */}
          <div className='flex flex-col gap-y-2 w-full'>
            <label className='text-[18px] font-semibold tracking-wider'>
              Specialization
            </label>
            <select
              {...register("specialization")}
              className='h-[41px] bg-[#f8f8f8] rounded-[10px] px-[10px] text-[#494656]'
            >
              <option value=''>Select specialization</option>
              <option value='portrait'>Portrait</option>
              <option value='abstract'>Abstract</option>
            </select>
          </div>

          {/* Rate Inputs */}
          <span className='text-[24px] font-semibold'>Rate</span>

          <div className='flex flex-col gap-y-2 w-full'>
            <label className='text-[18px] font-semibold tracking-wider'>
              Hourly Rate
            </label>
            <input
              type='number'
              {...register("hourlyRate", {
                required: "Hourly Rate is required"
              })}
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
            />
            {errors.hourlyRate && (
              <span className='text-red-500'>{errors.hourlyRate.message}</span>
            )}
          </div>

          {["tiny", "small", "medium", "large", "xl", "xxl"].map(
            (rate, index) => (
              <div className='flex flex-col gap-y-2 w-full' key={rate}>
                <label className='text-[18px] font-semibold tracking-[0.06em]'>
                  {
                    [
                      "Tiny tattoo: 1-5cm (1-2 hours)",
                      "Small tattoo: 5-10cm (1-3 hours)",
                      "Medium tattoo: 10-15cm (2-4 hours)",
                      "Large tattoo: 15-20cm (3-5 hours)",
                      "xl Rate",
                      "xxl Rate"
                    ][index]
                  }
                </label>
                <input
                  type="number"
                  {...register(rate as keyof ArtistFormData, {
                    required: `${rate} rate is required`
                  })}
                  className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
                />
                {errors[rate as keyof ArtistFormData] && (
                  <span className='text-red-500'>
                    {errors[rate as keyof ArtistFormData]?.message}
                  </span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Submit & Cancel Buttons */}
      <div className='flex float-right gap-x-[15.6px] ml-auto'>
        <button
          type='button'
          disabled={loading}
          onClick={() => {
            setShowModal(false);
            enableScroll();
          }}
          className='w-[124px] rounded-[12px] h-[47px] flex items-center justify-center border border-[#ececed]'
        >
          <span className='text-[15px] font-semibold'>Cancel</span>
        </button>
        <button
          type='submit'
          disabled={loading}
          className='w-[124px] rounded-[12px] h-[47px] flex items-center justify-center bg-black text-white'
        >
          <span className='text-[15px] font-semibold'>
            {loading ? "Saving..." : "Save"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default AddArtistForm;