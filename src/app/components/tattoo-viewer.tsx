"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import TattooViewerStep1 from "./tattoo-viewer-step-1";
import TattooViewerStep2 from "./tattoo-viewer-step-2";
import TattooViewerStep3 from "./tattoo-viewer-step-3";
import ModelViewer from "./model-viewer";
import { GenderProvider } from "@/app/contexts/GenderContext";
import { SkinProvider } from "@/app/contexts/SkinContext";
import { TattooOptionsProvider } from "@/app/contexts/TattooOptionsContext";
import { useSteps } from "@/app/contexts/TattooStepsContext";
import { ModelProvider } from "@/app/contexts/ModelContext";
import { useDecalMeshes } from "@/app/contexts/DecalMeshesContext";
import { TattooDesignsProvider } from "../contexts/TattooDesignsContext";
import Image from "next/image";
import TattooViewerStep5a from "./tattoo-viewer-step-5a";
import TattooViewerStep5b from "./tattoo-viewer-step-5b";

const TattooViewer = () => {
  const {
    // priceEstimate,
    // individualPrices,
    setTattooCloseups,
    setConfirmed3DModel
  } = useDecalMeshes();
  const { step, setStep } = useSteps();
  const searchParams = useSearchParams();
  const alert = searchParams.get("alert");
  
    const params = useParams();
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    checkMobileView();

    // Add resize listener
    window.addEventListener("resize", checkMobileView);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  useEffect(() => {
    if (step === 3) {
      setTattooCloseups([]);
      setConfirmed3DModel("");
    }
  }, [step, setTattooCloseups, setConfirmed3DModel]);

  useEffect(() => {
    if (alert === "cancel") {
      setStep(5); 
    }
  }, [alert, setStep]);

  
  const shouldShowNextStep = () => {
    if (step >= 5) return false;
    if (step === 4 && !params.id) return false; 
    return true;
  };

  function steps() {
    switch (step) {
      case 1:
        return <TattooViewerStep1 />;
      case 2:
        return <TattooViewerStep2 />;
      case 3:
        return <TattooViewerStep3 />;
      case 4:
        return <TattooViewerStep5a />;
      case 5:
        return <TattooViewerStep5b />;
      default:
        return null;
    }
  }

  return (
    <TattooDesignsProvider>
      <ModelProvider>
        <GenderProvider>
          <SkinProvider>
            <TattooOptionsProvider>
              {/* Alert notification */}
              {alert && (
                <div
                  className={`mt-4 px-4 py-3 rounded-lg ${
                    alert === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {alert === "success"
                    ? "Your payment has been successfully processed"
                    : "Payment could not be processed"}
                </div>
              )}

              {/* Main container */}
              <div className='w-full min-h-screen flex flex-col relative'>
                {/* Mobile layout: Model viewer at top, controls below */}
                {isMobileView && (
                  <div className='flex flex-col w-full max-w-full overflow-hidden z-30 px-8 gap-5'>
                    <div className='w-full h-[40vh] sticky top-0 z-10 bg-gray-100 shadow-md'>
                      <ModelViewer />
                    </div>

                    {/* Controls section */}
                    <div className='w-full flex flex-col gap-5'>
                      <div className='flex justify-between items-center'>
                        <div className='w-full flex justify-between items-center py-4 border-b border-borderColor'>
                          <span className='text-base'>Steps</span>
                          <span className='text-base'>
                            0{step < 5 ? step : 5} Of 05
                          </span>
                        </div>
                        {/* {step >= 3 && individualPrices.length > 0 && (
                          <div className='text-right'>
                            <span className='text-sm text-gray-500'>
                              Tattoos: {individualPrices.length}
                            </span>
                            <div className='font-bold'>
                              {priceEstimate
                                ? `${priceEstimate.toFixed(2)} €`
                                : "--"}
                            </div>
                          </div>
                        )} */}
                      </div>
                      <div>{steps()}</div>
                      <>
                        <div className='fixed bottom-0 left-0 right-0 bg-white p-3 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-30 flex items-center gap-2'>
                          {shouldShowNextStep() && (
                            <button
                              disabled={
                                step === 4 
                                
                              }

                              onClick={() => {
                                if (step < 5) setStep(step + 1);
                              }}
                              className='px-4 py-2 text-base tracking-wide flex items-center justify-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300 w-full '
                            >
                              <span>Next Step</span>
                              <span>→</span>
                            </button>
                          )}

                          {step > 1 && (
                            <button
                              onClick={() => {
                                if (step > 1) setStep(step - 1);
                                // if (step == 6) setStep(4);
                              }}
                              className={`px-4 py-2 text-base tracking-wide flex items-center justify-center gap-2 bg-transparent text-black rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-borderColor ${step === 5 || !shouldShowNextStep() ? 'w-full' : 'w-full'}`}
                            >
                              Go Back
                            </button>
                          )}
                        </div>
                      </>
                    </div>
                  </div>
                )}
                {/* Desktop layout: Side by side */}
                {!isMobileView && (
                  <div className='flex flex-row w-full h-full md:px-14 px-8 z-30'>
                    {/* Controls column */}
                    <div className='w-1/2 mr-8 flex flex-col gap-5'>
                      <div className='flex justify-between items-center w-full'>
                        <div className='w-full flex justify-between items-center py-4 border-b border-borderColor'>
                          <span className='text-base'>Steps</span>
                          <span className='text-base'>
                            0{step < 5 ? step : 5} Of 05
                          </span>
                        </div>
                        {/* {step >= 3 && individualPrices.length > 0 && (
                          <div className='text-right'>
                            <span className='text-sm text-gray-500'>
                              Tattoos: {individualPrices.length}
                            </span>
                            <div className='font-bold'>
                              {priceEstimate
                                ? `${priceEstimate.toFixed(2)} €`
                                : "--"}
                            </div>
                          </div>
                        )} */}
                      </div>

                      <div>{steps()}</div>

                      {/* Next button */}
                      <>
                        <div className='mt-4 flex items-center gap-2'>
                          {shouldShowNextStep() && (
                            <button
                              // disabled={
                              //   step === 4 &&
                              //   (!priceEstimate || priceEstimate === 0.0)
                              // }
                              onClick={() => {
                                if (step < 5) setStep(step + 1);
                              }}
                              className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors duration-300'
                            >
                              <span>Next Step</span>
                              <span>→</span>
                            </button>
                          )}

                          {step > 1 && (
                            <button
                              onClick={() => {
                                if (step > 1) setStep(step - 1);
                                // if (step == 6) setStep(4);
                              }}
                              className='px-4 py-2 text-base tracking-wide flex items-center gap-2 bg-transparent text-black rounded-xl hover:bg-gray-100 transition-colors duration-300 border border-borderColor'
                            >
                              Go Back
                            </button>
                          )}
                        </div>
                      </>
                    </div>

                    {/* Model viewer column */}
                    <div className='w-1/2 bg-gray-100 sticky top-0 h-screen'>
                      <ModelViewer />
                    </div>
                  </div>
                )}
                <div className='w-full h-full absolute z-0 top-0 left-0'>
                  <Image
                    src='/BlackDot3D.svg'
                    fill
                    alt='heroHeadingTatoo'
                    className='object-cover'
                  />
                </div>
              </div>
            </TattooOptionsProvider>
          </SkinProvider>
        </GenderProvider>
      </ModelProvider>
    </TattooDesignsProvider>
  );
};

export default TattooViewer;