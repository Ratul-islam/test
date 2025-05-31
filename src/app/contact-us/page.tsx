"use client";
import Image from "next/image";
import { useState } from "react";
import { FaCaretRight } from "react-icons/fa6";

interface errors {
  name?: string;
  email?: string;
  message?: string;
  phone?: string;
}

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState<errors>({
    name: "",
    email: "",
    message: "",
    phone: ""
  });

  // Handle form field change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Optionally, restrict phone input to numbers only as the user types
    if (name === "phone") {
      // Allow empty value, or only digits
      if (value === "" || /^[0-9\b]+$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newErrors: errors = {};

    // Name validation
    if (!formData.name) newErrors.name = "Name is required.";

    // Email validation
    if (!formData.email) newErrors.email = "Email is required.";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please provide a valid email.";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Mobile number is required.";
    } else if (!/^\d{7,15}$/.test(formData.phone)) {
      newErrors.phone =
        "Please enter a valid mobile number (7-15 digits, numbers only).";
    }

    // Message validation
    if (!formData.message) newErrors.message = "Message is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const response = await fetch("/api/contact_us_email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
      if (response.ok) {
        alert("Form submitted successfully! We will get back to you soon.");
      } else {
        console.error("Error sending email:", data.error);
        alert(
          "There was an error submitting the form. Please try again later."
        );
      }
    }
  };

  return (
    <section className='flex relative flex-col w-full overflow-x-hidden'>
      <div className='w-full md:px-14 px-8 py-8 flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-yellow-100 to-blue-100 relative'>
        <button className='rounded-lg bg-gradient-to-br from-[#71D5FF] to-[#70A9FF] flex items-center justify-center gap-2 px-2 py-1 z-30'>
          <span className='text-sm tracking-wide font-semibold'>
            Contact PRIC’D Team
          </span>
          <FaCaretRight className='text-sm tracking-wide' />
        </button>
        <div className='flex items-center justify-center z-30'>
          <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
            Contact Us
          </h1>
        </div>
        <form
          className='md:w-[45%] w-[90%] bg-white rounded-xl p-6 flex flex-col gap-4 items-center justify-between z-30'
          onSubmit={handleSubmit}
        >
          <div className='w-full flex flex-col gap-2 items-center mt-4'>
            <Image src='/logo.png' width={40} height={40} alt='logo' />
            <h1 className='font-semibold text-2xl text-center tracking-wider'>
              Contact Us!
            </h1>
            <p className='text-center tracking-wide text-sm md:w-[65%] w-full'>
            Let us know what we can help you with?
            </p>
          </div>
          <div className='flex flex-col items-center gap-2 w-full'>
            <div className='flex flex-col w-full gap-1'>
              <label className='text-sm tracking-wide'>Your name</label>
              <input
                className='py-3 bg-[#f8f8f8] rounded-xl px-2 text-sm w-full'
                required
                type='text'
                name='name'
                placeholder='name'
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <span className='text-red-500 text-sm mt-2'>{errors.name}</span>
              )}
            </div>
            <div className='flex flex-col w-full gap-1'>
              <label className='text-sm tracking-wide'>Email</label>
              <input
                className='py-3 bg-[#f8f8f8] rounded-xl px-2 text-sm w-full'
                type='email'
                required
                name='email'
                placeholder='example@gmail.com'
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <span className='text-red-500 text-sm mt-2'>
                  {errors.email}
                </span>
              )}
            </div>
            <div className='flex flex-col w-full'>
              <label className='text-sm tracking-wide'>Mobile Number</label>
              <input
                className='py-3 bg-[#f8f8f8] rounded-xl px-2 text-sm w-full'
                name='phone'
                placeholder='123456789'
                value={formData.phone}
                onChange={handleChange}
                maxLength={15}
                required
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.phone && (
                <span className='text-red-500 text-sm mt-2'>{errors.phone}</span>
              )}
            </div>
          </div>
          <div className='flex flex-col w-full'>
            <textarea
              className='py-3 bg-[#f8f8f8] rounded-xl px-2 text-sm w-full'
              required
              name='message'
              rows={5}
              placeholder='enter message'
              value={formData.message}
              onChange={handleChange}
            ></textarea>
            {errors.message && (
              <span className='text-red-500 text-sm mt-2'>
                {errors.message}
              </span>
            )}
          </div>

          <button
            type='submit'
            className='text-base bg-black rounded-xl py-3 px-2 w-full flex items-center justify-center text-white'
          >
            Send to Sales
          </button>
        </form>
        <div className='w-full py-20 bg-white shadow-3xl shadow-white absolute z-0 bottom-[20%] left-0 blur-2xl' />  
      </div>

      {/* contact us */}
      {/* <section
        ref={ref2}
        className={`mt-[82px] bg-grey h-[450px] px-[240px] py-[80px] gap-x-[70px] flex transition-opacity ease-in duration-700
          xl:px-[120px]
          laptop:px-[40px] laptop:gap-x-[20px]
          tablet:justify-between tablet:flex-col laptop:h-fit tablet:items-center tablet:px-[20px]
          ${isVisible2 ? "opacity-100" : "opacity-0"} `}
      >
        <div className='max-w-[575px] tablet:text-center'>
          <span className='text-[24px]'>Contact Info</span>
          <h2 className='text-[56px] laptop:text-[40px] mobile:text-[32px] mt-5 leading-[140%]'>
            We are always happy to <br /> assist you
          </h2>
        </div>
        <div className='text-[22px] flex mt-7 ml-14 tablet:ml-0 tablet:items-center gap-x-[164px] laptop:gap-x-[32px]'>
          <ul className='flex flex-col gap-y-[22px]'>
            <li>Email Address</li>
            <li className='h-[3px] w-[27px] bg-black'></li>
            <li>
              <a href='mailto:help@info.com'>help@info.com</a>
            </li>

            <li className='max-w-[245px] text-[20px]'>
              Assistance hours:
              <br /> Monday - Friday 6 am to 8 pm EST
            </li>
          </ul>
          <ul className='flex flex-col gap-y-[22px]'>
            <li>Number</li>
            <li className='h-[3px] w-[27px] bg-black '></li>
            <li className='whitespace-nowrap'>
              <a href='tel:+180899834256'>(808) 998-34256</a>
            </li>{" "}
            <li className='max-w-[245px] leading-[160%] text-[20px]'>
              Assistance hours:
              <br /> Monday - Friday 6 am to 8 pm EST
            </li>
          </ul>
        </div>
      </section> */}
    </section>
  );
}