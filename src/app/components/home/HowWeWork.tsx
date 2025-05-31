import Image from "next/image";
import React from "react";
import { FaAngleRight } from "react-icons/fa6";
import { AiOutlineUpload } from "react-icons/ai";

const HowWeWork = () => {
  return (
    <section className='w-full md:px-14 px-8 md:py-20 py-14 flex flex-col gap-3 items-center justify-center bg-[#f2f2f2]'>
      <h1 className='font-bold text-5xl text-center tracking-wide'>
        How We Work
      </h1>

      <div className='flex flex-col gap-3 items-center justify-center'>
        <p className='text-center tracking-wide text-base md:w-[60%] w-full'>
          With Pric’d, your clients simply chose their gender, skin tone, upload
          their tattoo design, place it on a 3D model to visualize sizing and
          placement, instantly receive a price estimate, select available date
          in the chosen artists diary, pay your deposit and book in.
        </p>
        <p className='text-center tracking-wide text-base md:w-[60%] w-full'>
          Artists can connect their diaries, show available dates, see who has
          booked in and receive each despot along with the tattoo design and
          full client information. No more back and forth trying to sell.
        </p>
      </div>

      <div className='flex flex-col w-full gap-2 mt-16  rounded-xl relative z-30  '>
        {/* <div className="w-[95%] h-[95%] bg-[#d6d6d6] absolute top-[10%] left-[3%] blur-3xl z-0 "/> */}
        {/* 1st Part */}
        <div className='w-full flex md:flex-row flex-col gap-2 justify-between rounded-xl z-30'>
          {/* 1st Slide */}
          <div className='w-full md:w-[59%] h-64 bg-white rounded-xl flex items-center cursor-default shadow-xl shadow-[#D6D6D6]'>
            <div className='w-1/2 h-full flex flex-col justify-between p-4'>
              <div
                className='flex flex-col gap-2
              '
              >
                <div className='text-sm font-semibold tracking-wide flex items-center gap-1'>
                  <span>Choose Design</span>
                  <FaAngleRight />
                </div>
                <p className='text-xs'>
                  Choose gender and skin tone. Optimized to work on seamlessly.
                  Select on your preferences.
                </p>
              </div>
              <Image
                src='/HowWeWork1B.svg'
                width={180}
                height={180}
                alt='How We Work'
              />
            </div>
            <div className='w-1/2 h-full flex items-center justify-center relative overflow-hidden '>
              <Image src='/HowWeWork1.svg' fill alt='How We Work' />
            </div>
          </div>
          {/* 2nd Slide */}
          <div className='w-full md:w-[40%] h-64 bg-white rounded-xl flex flex-col justify-between p-4 cursor-default shadow-xl shadow-[#D6D6D6]'>
            <div className='w-full h-[35%] flex flex-col gap-2'>
              <div className='text-sm font-semibold tracking-wide flex items-center gap-1'>
                <span>Upload Design</span>
                <FaAngleRight />
              </div>
              <p className='text-xs md:w-[50%] w-full'>
                Upload designs on to 3D models and get a accurate measure of the
                tattoo placement.
              </p>
            </div>
            <div className='w-full h-[63%] border-2 border-dashed border-[#C1ECFF] flex flex-col gap-2 items-center justify-center rounded-xl overflow-hidden'>
              <AiOutlineUpload className='text-4xl font-semibold text-[#7058F6]' />
              <h5 className='text-sm font-semibold tracking-wide'>
                Uplaod Design
              </h5>
              <p className='text-xs'>Upload a design file to get started.</p>
            </div>
          </div>
        </div>
        {/* 2nd Part */}
        <div className='w-full flex md:flex-row flex-col gap-2 justify-between rounded-xl  z-30'>
          {/* 1st Slide */}
          <div className='w-full md:w-[33%] h-64 bg-white rounded-xl overflow-hidden flex flex-col justify-between cursor-default shadow-xl shadow-[#D6D6D6]'>
            <div className='w-full h-[65%] relative'>
              <Image
                src='/HowWeWork2A.svg'
                fill
                className='object-cover'
                alt='How We Work'
              />
            </div>
            <div className='w-full h-[35%] flex flex-col justify-center gap-2 p-4'>
              <div className='text-sm font-semibold tracking-wide flex items-center gap-1'>
                <span>Choose Placement</span>
                <FaAngleRight />
              </div>
              <p className='text-xs'>Choose placement and scale to size.</p>
            </div>
          </div>
          {/* 2nd Slide */}
          <div className='w-full md:w-[33%] h-64 bg-white rounded-xl flex flex-col justify-between cursor-default  relative overflow-hidden shadow-xl shadow-[#D6D6D6]'>
            <div className='w-full h-[35%] flex flex-col gap-2 p-4'>
              <div className='text-sm font-semibold tracking-wide flex items-center gap-1'>
                <span>Book a Date </span>
                <FaAngleRight />
              </div>
              <p className='text-xs md:w-[50%] w-full'>
                Request dates you want to book in for.
              </p>
            </div>
            <div className='w-full h-[65%] relative'>
              <Image
                src='/HowWeWork2B.svg'
                fill
                className='object-cover'
                alt='How We Work'
              />
            </div>
            <div className='w-full h-[70%] absolute bottom-0 left-0 bg-gradient-to-b from-white to-[#E8E8FF] opacity-25'></div>
          </div>
          {/* 3rd Slide */}
          <div className='w-full md:w-[33%] h-64 bg-white rounded-xl flex flex-col justify-between cursor-default  overflow-hidden shadow-xl shadow-[#D6D6D6]'>
            <div className='w-full h-[35%] flex flex-col gap-2 p-4'>
              <div className='text-sm font-semibold tracking-wide flex items-center gap-1'>
                <span>Pay Deposit</span>
                <FaAngleRight />
              </div>
              <p className='text-xs md:w-[50%] w-full'>
                Get your estimate and pay deposit.
              </p>
            </div>
            <div className='w-[60%] h-[65%] self-end relative'>
              <Image
                src='/HowWeWork2C.svg'
                fill
                className='object-contain'
                alt='How We Work'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowWeWork;
