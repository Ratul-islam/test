/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import ProfileUploader from "./profileUploader";
import Modal from "./modal";
import { ImageIcon, UploadCloud, X } from "lucide-react";

interface ImageUploaderProps {
  currentImageUrl?: string;
  onImageChange?: (file: File | null, previewUrl: string | null) => void;
}

const ImageUploader = ({ currentImageUrl, onImageChange }: ImageUploaderProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [size, setSize] = useState<number>(400); // Image size percentage
  const [displayImage, setDisplayImage] = useState<string>("/dashboard/default.png");

  // Update display image when currentImageUrl changes
  useEffect(() => {
    if (currentImageUrl) {
      setDisplayImage(currentImageUrl);
    }
  }, [currentImageUrl]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setPreview(null);
    setImage(null);
    setSize(400);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file)); // Preview the image
    }
  };

  const onChangeProfilePhoto = (imageUrl: string | null, file: File | null = null) => {
    if (imageUrl) {
      setDisplayImage(imageUrl);
    } else {
      setDisplayImage("/dashboard/default.png");
    }
    
    // Notify parent component about the change
    if (onImageChange) {
      onImageChange(file, imageUrl);
    }
  };

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]; // Get the first file
    setImage(file);

    // Generate preview
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreview(fileReader.result as string);
    };
    fileReader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] }, // Accept only images
    multiple: false // Allow only one file
  });

  const handleUpload = async () => {
    if (image && preview) {
      // Update the display image with the preview
      onChangeProfilePhoto(preview, image);
      
      // Close modal and reset state
      setIsModalOpen(false);
      setPreview(null);
      setImage(null);
      setSize(400);
    }
  };

  const handleRemove = () => {
    setImage(null);
    setPreview(null);
    onChangeProfilePhoto(null, null);
  };

  return (
    <div>
      <div
        className='relative'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          height={155}
          width={155}
          src={displayImage}
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
                  width={size}
                  height={size}
                  className='object-cover rounded-lg border border-gray-300 m-auto'
                />
              </div>
              {/* Image Size Adjustment */}
              <div className='flex flex-row items-center mt-3'>
                <ImageIcon />
                <input
                  type='range'
                  min='10'
                  max='300'
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

export default ImageUploader;