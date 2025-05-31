"use client";
import Modal from "@/app/components/modal";
import StepOne from "@/app/components/starting-your-free-trial/step-1";
import StepTwo from "@/app/components/starting-your-free-trial/step-2";
import StepThree from "@/app/components/starting-your-free-trial/step-3";
import StepFour from "@/app/components/starting-your-free-trial/step-4";
import StepFive from "@/app/components/starting-your-free-trial/step-5";
import { enableScroll } from "@/app/utils/scrollbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaCaretRight } from "react-icons/fa6";
import { FreeTrialData } from "./types";
import Link from "next/link";

const WaitingList = () => {
  const [step, setStep] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FreeTrialData>({});
  
  // Save form data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('freeTrialData', JSON.stringify(formData));
  }, [formData]);
  
  // Update form data handler
  const updateFormData = (data: Partial<FreeTrialData>) => {
    setFormData(prev => {
      const filtered = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined)
      ) as FreeTrialData;
      return { ...prev, ...filtered };
    });
  };
  
  const getStep = () => {
    switch (step) {
      case 1:
        return <StepOne setStep={setStep} updateFormData={updateFormData} />;
      case 2:
        return <StepTwo setStep={setStep} updateFormData={updateFormData} />;
      case 3:
        return <StepThree setStep={setStep} updateFormData={updateFormData} />;
      case 4:
        return <StepFour setStep={setStep} updateFormData={updateFormData} />;
      case 5:
        return <StepFive setStep={setStep} setShowModal={setShowModal} updateFormData={updateFormData} />;
      default:
        return null;
    }
  };


  return (
    <section className='w-full md:py-20 py-14 flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-yellow-100 to-blue-100 relative'>
      <button className='rounded-lg bg-gradient-to-br from-[#71D5FF] to-[#70A9FF] flex items-center justify-center gap-2 px-2 py-1 relative z-30'>
        <span className='text-sm tracking-wide font-semibold'>
          Choose your model and design
        </span>
        <FaCaretRight className='text-sm tracking-wide' />
      </button>
      <div className='flex items-center justify-center z-30 mb-20 '>
        <h1 className='font-bold md:text-7xl text-5xl text-center tracking-wide'>
          Start Your
          <span className='relative p-3'>
            <span className='relative z-30'>Free</span>
            <Image
              src='heroHeadingTatoo.svg'
              fill
              alt='heroHeadingTatoo'
              className='z-0 absolute top-0 md:-left-1 left-0'
            />
          </span>
          Trial
        </h1>
      </div>
      <div className='w-full h-[80vh] relative z-30'>
        <div className='flex md:flex-row flex-col-reverse w-full h-full md:px-14 px-8 relative z-30'>
          {/* Controls column */}
          <div className='md:w-1/2 w-full md:mr-8 flex flex-col gap-5'>
            <div className='flex justify-between items-center w-full'>
              <div className='w-full flex justify-between items-center py-4 border-b border-borderColor'>
                <span className='text-base'>Steps</span>
                <span className='text-base'>0{step} Of 05</span>
              </div>
            </div>

            <div>{getStep()}</div>
          </div>
          <div className='md:w-1/2 w-full flex items-center justify-center h-full relative rounded-xl'>
            <Image
              src='/FreeTrailImage3D.png'
              fill
              alt='FreeTrial'
              className='object-cover object-top rounded-xl border border-[#d7d7d7]'
            />
          </div>
        </div>
        <div className='w-full h-full absolute z-0 top-0 left-0'>
          <Image
            src='BlackDot3D.svg'
            fill
            alt='heroHeadingTatoo'
            className='object-cover'
          />
        </div>
      </div>
      <Modal
        bg='bg-black/50'
        setShowModal={setShowModal}
        showModal={showModal}
        before='invisible bg-black/75'
        after='visible'
        contentCenter={true}
      >
        <div
          className='w-full h-full bg-white rounded-xl p-10 flex flex-col gap-3 justify-center items-center relative'
        >
          <div
            onClick={() => {
              enableScroll();
              setShowModal(false);
            }}
            className='absolute right-2 top-2 p-1 hover:bg-black/30 duration-200 rounded-[50%] cursor-pointer'
          >
            <Image
              src='/dashboard/close-modal.svg'
              height={20}
              width={20}
              alt='close-modal'
            />
          </div>
          <Image src='/Wow.svg' height={150} width={150} alt='congrat' />
          <p className='text-2xl tracking-wide leading-snug font-medium text-center'>
            You&apos;re all set! <br /> Thank you for signing up!
          </p>
          <p className='tracking-wide text-sm w-full text-center'>
            We&apos;ve sent welcome videos to your email. Check your inbox to get started!
          </p>
          <div className='mt-4 flex items-center gap-2'>
            <Link href="/tattoo-viewer">
            <button
              onClick={() => {}}
              className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300'
              >
              Try our demo!
            </button>
              </Link>
          </div>
        </div>
      </Modal>
      <div className='w-full py-20 bg-white shadow-3xl shadow-white absolute z-0 bottom-14 left-0 blur-2xl' />
    </section>
  );
};

export default WaitingList;