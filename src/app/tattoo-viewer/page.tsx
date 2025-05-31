"use client";
import { StepsProvider } from "@/app/contexts/TattooStepsContext";
import { DecalMeshesProvider } from "@/app/contexts/DecalMeshesContext";
import { GuidanceProvider } from "../contexts/GuidanceContext";
import { FaCaretRight } from "react-icons/fa6";
import TattooViewer from "../components/tattoo-viewer";

const ThreeDimView = () => {
  return (
    <StepsProvider>
      <DecalMeshesProvider>
        <section className='w-full md:py-20 py-14 flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-yellow-100 to-blue-100 relative'>
          <button className='rounded-lg bg-gradient-to-br from-[#71D5FF] to-[#70A9FF] flex items-center justify-center gap-2 px-2 py-1 relative z-30'>
            <span className='text-sm tracking-wide font-semibold'>
              Choose your model and design
            </span>
            <FaCaretRight className='text-sm tracking-wide' />
          </button>
          <div className='flex items-center justify-center relative z-30 mb-20'>
            <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
              3D Model
            </h1>
          </div>
          <GuidanceProvider>
            <section className={`w-full relative z-30`}>
              <TattooViewer />
            </section>
          </GuidanceProvider>
          <div className='w-full py-20 bg-white shadow-3xl shadow-white absolute z-0 bottom-14 left-0 blur-2xl' />
        </section>
      </DecalMeshesProvider>
    </StepsProvider>
  );
};

export default ThreeDimView;
