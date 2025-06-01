/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useCallback, useState } from "react";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

import ProfileUploader from "./profileUploader";
import Modal from "./modal";

const ProfileComponent = (props: any) => {
  const { user, session, onChangeProfilePhoto } = props;
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<number>(100); // Image size percentage

  const handleCloseModal = () => setIsModalOpen(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Preview the image
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Get the first file
    setImage(file);

    // Generate preview using URL.createObjectURL instead of FileReader
    // This avoids creating base64 data URLs
    setPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Accept only images
    multiple: false // Allow only one file
  });

  const handleUpload = async () => {
    if (image && preview) {
      // Pass both the actual File object and preview URL
      // This ensures the File object is sent as binary data
      onChangeProfilePhoto(image, preview);
      
      setIsModalOpen(false);
      setPreview(null);
      setImage(null);
      setSize(100);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setPreview(null);
    // Pass null for both File and preview URL
    onChangeProfilePhoto(null, null);
  };

  return (
    <div
      className='flex tablet:flex-col min-w-[324px] gap-x-4 tablet:gap-x-2 border-[#e0e0e0] border-r-[1px] pr-[53px]
        laptop:min-w-[240px] tablet:min-w-fit tablet:pr-4 tablet:pl-2'
    >
      <div
        className='relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          height={155}
          width={155}
          src={user?.image || "/dashboard/default.png"}
          alt='profile'
          className={`laptop:w-[100px] laptop:h-[100px] tablet:w-20 tablet:h-20 rounded-full object-cover hover:scale-110 min-w-[155px] min-h-[155px]`}
        />
        <div className='absolute inset-0 bg-black/30 hover:bg-black/50 transition duration-300 rounded-full z-10'></div>
        {isHovered && (
          <ProfileUploader
            setIsModalOpen={setIsModalOpen}
            onChangeProfilePhoto={onChangeProfilePhoto}
          />
        )}
      </div>

      <div className='flex flex-col justify-between h-[141px] tablet:justify-around'>
        <div className='flex flex-col gap-y-[8px] tablet:gap-y-0'>
          <span className='text-[24px] tablet:text-[18px] font-bold tracking-[-0.02em] mobile:text-center'>
            {user?.name}
          </span>
          <span
            title={session?.email}
            className='text-[#9b9b9b] tablet:text-[13px] mobile:text-[11px] mobile:text-center truncate max-w-[100px]'
          >
            {user?.email}
          </span>
        </div>
        <div
          className=' w-fit px-6 h-[32px] rounded-[14px] flex items-center justify-center text-center font-bold text-[12px]
        bg-gradient-to-b from-[#d9edff] to-[#f8f8f8] '
        >
          Artist
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className='text-center'>
          <h2 className='text-2xl mb-4'>Change Profile Photo</h2>
          {!preview ? (
            <div className='mb-4 flex justify-center'>
              <div
                {...getRootProps()}
                className='w-40 h-40 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-full cursor-pointer hover:bg-gray-100 transition p-4 relative'
              >
                <input {...getInputProps()} />
                <UploadCloud className='w-10 h-10 text-gray-500' />
                <p className='text-xs text-gray-600 text-center mt-2'>
                  Drag and drop your images here
                </p>
              </div>
              <input
                id='file-upload'
                type='file'
                accept='image/*'
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className='flex flex-col justify-center align-middle  p-2 border rounded-lg shadow-md'>
              <div className="flex flex-col justify-center align-middle relative p-2 min-h-[320px] bg-[url('/dashboard/mwFzF.png')]">
                {/* Close Button */}
                <button
                  className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition'
                  onClick={handleRemove}
                >
                  <X size={16} />
                </button>
                {/* Image Preview */}
                <Image
                  src={preview}
                  alt='Preview'
                  width={400}
                  height={400}
                  className='object-cover rounded-lg border border-gray-300 m-auto'
                  // style={{ width: `${size}%`, height: "auto" }}
                />
              </div>
              {/* Image Size Adjustment */}
              <div className='flex flex-row items-center mt-3'>
                <ImageIcon />
                <input
                  type='range'
                  min='50'
                  max='100'
                  value={size}
                  onChange={e => setSize(Number(e.target.value))}
                  className='mt-1 w-full bg-gray-300 accent-black'
                />
                <ImageIcon size={40} />
              </div>
            </div>
          )}
          <div className='flex mt-4 justify-end'>
            <button
              onClick={handleCloseModal}
              data-dialog-close='true'
              className='rounded-md border border-transparent py-2 px-4 text-center text-sm transition-all text-slate-600 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none mr-4'
              type='button'
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!image}
              className='p-2 bg-black text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
            >
              Upload
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileComponent;