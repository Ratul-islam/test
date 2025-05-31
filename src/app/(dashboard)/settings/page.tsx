/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  updateAdminProfile,
  fetchUserSession
} from "@/app/services/userService";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import ImageUploader from "@/app/components/dashboard/ImageUploader";

const Settings = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    depositPercentage: "",
    image: {} as any
  });

  const [userDetails, setUserDetails] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const { data: session } = useSession();
  
  const getAdmins = async () => {
    const [res, err] = await fetchUserSession({});
    if (!err) {
      const { name, email, phone, depositPercentage, image } = res;
      setFormValues({
        name,
        email,
        phone,
        depositPercentage,
        image: { file: null, url: image ? image : "/dashboard/default.png" }
      });
      setUserDetails(res);
    }
  };

  useEffect(() => {
    getAdmins();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  // const handleReset = async () => {
  //   const [res, err] = await fetchUserSession({});
  //   if(!err) {
  //     const {name,email, phone,depositPercentage, image} = res
  //     setFormValues({name,email,phone,depositPercentage, image:{file: null, url:image ? image : "/dashboard/default.png"}})
  //   }
  // }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    if (!session || !session.user) {
      toast.error("Session not available");
      return;
    }
  
    setLoading(true);
  
    const formData = new FormData();
    formData.append("adminId", session.user.id);
    formData.append("name", formValues.name);
    formData.append("phone", formValues.phone);
    formData.append("depositPercentage", formValues.depositPercentage);
    if (formValues.image.file) formData.append("image", formValues.image.file);
  
    await updateAdminProfile({ body: formData });
    setLoading(false);
    getAdmins();
    toast.success("User updated successfully!");
  };

   const handleImageChange = (file: File | null, previewUrl: string | null) => {
    setFormValues({
      ...formValues,
      image: {
        file: file,
        url: previewUrl || "/dashboard/default.png"
      }
    });
  };


  return (
    <section className='m-4 bg-white rounded-[16px] p-6 mobile:p-3 mobile:m-1 pb-20'>
      <div className='h-[150px] rounded-[19px] w-full bg-gradient-to-r from-[#8ED5FF]/50 via-[#BFF9FF]/50 to-[#D255FF]/50'></div>
      <div className='flex ml-4 relative mobile:ml-0 mt-2'>
        {/* <Image
          src={formValues?.image?.url ?? "/dashboard/default.png"}
          width={128}
          height={128}
          alt='avatar'
          style={{ objectFit: "cover", width: "128px", height: "128px" }}
          className='absolute w-34 h-34 mobile:left-0 mobile:right-0 mobile:mx-auto cursor-pointer object-cover rounded-full'
          onClick={handleImageClick}
        />

        <input
          type='file'
          accept='image/*'
          ref={fileInputRef}
          className='hidden'
          onChange={handleFileChange}
        /> */}

   <ImageUploader 
          currentImageUrl={formValues?.image?.url}
          onImageChange={handleImageChange}
        />
        <div className='flex flex-col mt-4 gap-y-2 text-black ml-8 mobile:ml-0 mobile:mt-[130px]'>
          <h2 className='font-semibold text-[33px] tracking-wider'>
            {userDetails?.name}
          </h2>
          <span className='text-[22px] leading-[100%] tracking-wider'>
            {userDetails?.email}
          </span>
        </div>
      </div>

      {/* forms */}
      <div className='flex gap-x-[70px] w-full mt-[55px] ml-4 mobile:ml-0 laptop:flex-col laptop:gap-y-10 mobile:pb-10 pt-5'>
        <form className='mt-2 w-full max-w-[729px]' onSubmit={handleSubmit}>
          <h3 className='text-[26px] tracking-wider leading-[154%] font-semibold mobile:text-[20px]'>
            Profile Settings
          </h3>
          <div className='flex mt-8 gap-x-[41px] justify-between items-center laptop:gap-x-5 tablet:text-left mobile:flex-col mobile:gap-y-6'>
            <div className='flex gap-x-[28px] w-full items-center laptop:gap-x-1 tablet:flex-col tablet:items-start tablet:gap-y-2'>
              <label className='text-[14px] font-semibold tracking-wider truncate min-w-fit'>
                First Name
              </label>
              <input
                className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider max-w-[245px] w-full bg-[#f8f8f8] h-[41px] laptop:max-w-full'
                name='name'
                value={formValues.name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='mt-6 flex flex-col gap-y-2 w-full'>
            <label className='text-[14px] font-semibold tracking-wider'>
              Email
            </label>
            <input
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
              name='email'
              value={formValues.email}
              onChange={handleChange}
            />
          </div>
          <div className='mt-6 flex flex-col gap-y-2 w-full'>
            <label className='text-[14px] font-semibold tracking-wider'>
              Phone
            </label>
            <input
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full bg-[#f8f8f8] h-[41px]'
              name='phone'
              value={formValues.phone}
              onChange={e => {
                const cleanedValue = e.target.value
                  .replace(/[^0-9]/g, "")
                  .slice(0, 20);
                setFormValues({
                  ...formValues,
                  phone: cleanedValue
                });
              }}
            />
          </div>

          <div className='mt-7 flex gap-x-4'>
            {/* <button
            <button
            onClick={handleReset}
              type="button"
              className="border border-[#ececed] rounded-[12px] w-[124px] h-[47px] mobile:w-20 mobile:h-10"
            >
              Reset
            </button> */}
            <button
              type='submit'
              disabled={loading}
              className='bg-black rounded-[12px] w-[124px] h-[47px] text-white mobile:w-20 mobile:h-10'
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
        <form
          className='w-full mt-1 laptop:max-w-[729px]'
          onSubmit={handleSubmit}
        >
          {session?.user.userType != "ADMIN" && (<>

          <h3 className='text-[26px] tracking-wider leading-[154%] font-semibold mobile:text-[20px]'>
            Configuration Settings
          </h3>
          <div className='flex gap-x-[28px] w-full items-center mt-8 mobile:flex-col mobile:items-start mobile:gap-y-2'>
            <label className='text-[14px] min-w-fit truncate font-semibold tracking-wider'>
              Deposit Percentage
            </label>
            <input
              className='rounded-[8px] px-[10.5px] text-[12px] tracking-wider w-full max-w-[646px] bg-[#f8f8f8] h-[41px]'
              name='depositPercentage'
              value={formValues.depositPercentage}
              onChange={handleChange}
            />
          </div>
          <div className='mt-7 flex gap-x-4 float-right mr-4 laptop:float-left'>
            {/* <button
              type="button"
              className="border border-[#ececed] rounded-[12px] w-[124px] h-[47px] mobile:w-20 mobile:h-10"
              onClick={handleReset}
            >
              Reset
            </button> */}
            <button
              type='submit'
              disabled={loading}
              onClick={handleSubmit}
              className='bg-black rounded-[12px] w-[124px] h-[47px] text-white mobile:w-20 mobile:h-10'
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
          </> ) }

        </form>
      </div>
    </section>
  );
};

export default Settings;
