"use client";

import React from "react";
import { enableScroll } from "@/app/utils/scrollbar";
import Image from "next/image";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  setCurrentIndex,
}) => {
  if (!isOpen) return null;
  
  // Filter out any empty strings or undefined values
  const validImages = images.filter(img => img && img.trim() !== '');
  
  // Only show navigation if we have more than one valid image
  const showNavigation = validImages.length > 1;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((currentIndex - 1 + validImages.length) % validImages.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((currentIndex + 1) % validImages.length);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
      onClick={() => {
        onClose();
        enableScroll();
      }}
    >
      <div
        className="relative max-w-[90%] max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 bg-white/20 rounded-full p-2 z-10"
          onClick={() => {
            onClose();
            enableScroll();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <Image
          src={validImages[currentIndex]}
          alt={`Tattoo view ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain"
        />

        {/* Navigation buttons, only render if more than one valid image */}
        {showNavigation && (
          <>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-3"
              onClick={handlePrev}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 rounded-full p-3"
              onClick={handleNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter, only render if more than one valid image */}
        {showNavigation && (
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            {currentIndex + 1} / {validImages.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageModal;