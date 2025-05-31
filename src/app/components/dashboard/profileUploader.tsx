/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from 'react';
import Image from 'next/image';

const ProfileUploader = (props: any) => {
  const { onChangeProfilePhoto, setIsModalOpen } = props;
  const [isOpenDropDown, setIsOpenDropDown] = useState<boolean | null>(false);

  const handleOpenModal = () => {
    setIsOpenDropDown(false);
    setIsModalOpen(true);
  }
  const handleOpenDropDown = () => setIsOpenDropDown(true);

  const handleRemoveImage = (e: any) => {
    e.stopPropagation();
    setIsOpenDropDown(false);
    onChangeProfilePhoto('');
  }

  return (
    <div className="absolute inset-0 m-auto flex justify-center">
      <button
        type="button"
        onClick={handleOpenDropDown}
        className="flex items-center p-2 rounded-full z-20"
      >
        <Image
          height={43}
          width={44}
          color='white'
          alt='box'
          src='camera.svg'
        />
        {isOpenDropDown && (
          <div className="absolute top-12 right-0 w-64 bg-white shadow-lg border border-gray-200 rounded-lg p-3 z-50">
            <ul className="mt-2">
              <li
                onClick={handleOpenModal}
                className="text-gray-600 text-sm p-2 border-b last:border-none hover:bg-gray-100"
              >
                Change profile photo
              </li>
              <li
                onClick={handleRemoveImage}
                className="text-gray-600 text-sm p-2 border-b last:border-none hover:bg-gray-100"
              >
                Remove
              </li>
            </ul>
          </div>
        )}
      </button>
    </div>
  );
};

export default ProfileUploader;