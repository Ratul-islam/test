"use client";

import React from "react";
import { useSkin } from "@/app/contexts/SkinContext";

const TattooViewerStep2 = () => {
  const { skinIndex, setSkinIndex } = useSkin();

  return (
    <div className='w-full flex flex-col gap-5'>
      <div className='w-full flex flex-col gap-1'>
        <h2 className='text-4xl tracking-widest leading-snug font-semibold'>
          Please select your
          <br />
          skin tone.
        </h2>
        <p className='tracking-wide text-base w-full'>
          So the artist can understand and prepare your design accordingly.
        </p>
      </div>

      {/* Skin Tone Options */}
      <div className='flex md:flex-row flex-col flex-wrap gap-2 items-center justify-between w-full'>
        {/* White Skin */}
        <div
          onClick={() => {
            setSkinIndex(0);
          }}
          className={`relative h-32 md:w-[49%] w-full border ${skinIndex == 0 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='skinIndex'
            checked={skinIndex === 0}
            id='whiteSkin'
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='whiteSkin'
            className={`flex items-end justify-start w-full h-full cursor-pointer ${skinIndex == 0 ? "text-black" : "text-white"} bg-[#f5e8dc]`}
          >
            <span className='font-medium text-xl pl-2 pb-2'>White Skin</span>
          </label>
        </div>

        {/* Olive Skin */}
        <div
          onClick={() => {
            setSkinIndex(1);
          }}
          className={`relative h-32 md:w-[49%] w-full border ${skinIndex == 1 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='skinIndex'
            checked={skinIndex === 1}
            id='oliveSkin'
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='oliveSkin'
            className={`flex items-end justify-start w-full h-full cursor-pointer ${skinIndex == 1 ? "text-black" : "text-white"} bg-[#c89d68]`}
          >
            <span className='font-medium text-xl pl-2 pb-2'>Olive Skin</span>
          </label>
        </div>
        {/* Brown Skin */}
        <div
          onClick={() => {
            setSkinIndex(2);
          }}
          className={`relative h-32 md:w-[49%] w-full border ${skinIndex == 2 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='skinIndex'
            id='brownSkin'
            checked={skinIndex === 2}
            onChange={() => {}}
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='brownSkin'
            className={`flex items-end justify-start w-full h-full cursor-pointer ${skinIndex == 2 ? "text-black" : "text-white"} bg-[#a05a2c]`}
          >
            <span className='font-medium text-xl pl-2 pb-2'>Brown</span>
          </label>
        </div>
        {/* Dark Skin */}
        <div
          onClick={() => {
            setSkinIndex(3);
          }}
          className={`relative h-32 md:w-[49%] w-full border ${skinIndex == 3 ? "border-black" : "border-borderColor"} rounded-xl overflow-hidden`}
        >
          <input
            type='radio'
            name='skinIndex'
            id='darkSkin'
            checked={skinIndex === 3}
            onChange={() => {}}
            className='absolute top-2 left-2 h-5 w-5 accent-black cursor-pointer'
          />
          <label
            htmlFor='darkSkin'
            className={`flex items-end justify-start w-full h-full cursor-pointer ${skinIndex == 3 ? "text-black" : "text-white"} bg-[#5b3a24]`}
          >
            <span className='font-medium text-xl pl-2 pb-2'>Dark Skin</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TattooViewerStep2;
