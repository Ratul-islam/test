/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
// import React, { useState } from "react";

interface props {
  checked?: boolean;
  onChange?: (e: any) => void;
}

const Switcher4: React.FC<props> = ({ onChange, checked = true }) => {
  // const [isChecked, setIsChecked] = useState(checked);

  // const handleCheckboxChange = () => {
  //   setIsChecked(!isChecked);
  // };

  return (
    <>
      <label className='flex cursor-pointer select-none items-center'>
        <div className='relative'>
          <input
            type='checkbox'
            checked={checked}
            onChange={onChange}
            className='sr-only'
          />
          <div
            className={`box block h-[23px] w-[40px] rounded-full ${
              checked ? "bg-[#6f58f6]" : "bg-black/50"
            }`}
          ></div>
          <div
            className={`absolute left-1 top-[2px] flex h-[17px] w-[17px] items-center justify-center rounded-full bg-white transition ${
              checked ? "translate-x-full" : ""
            }`}
          ></div>
        </div>
      </label>
    </>
  );
};

export default Switcher4;
