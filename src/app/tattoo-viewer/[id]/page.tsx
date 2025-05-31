"use client";
// import Header from "@/app/components/header";
import TattooViewer from "@/app/components/tattoo-viewer";
import { StepsProvider } from "@/app/contexts/TattooStepsContext";
import useInView from "@/app/hooks/useVisible";
import { DecalMeshesProvider } from "@/app/contexts/DecalMeshesContext";
import { GuidanceProvider } from "@/app/contexts/GuidanceContext";

const ThreeDimView = () => {
  const [isVisible1, ref1] = useInView({ threshold: 0.1 });

  return (
    <StepsProvider>
      <DecalMeshesProvider>
      <GuidanceProvider>
        <section className='flex relative flex-col mx-auto max-w-[1920px] overflow-x-hidden'>
          {/* <Header /> */}
          <section
            ref={ref1}
            className={`mt-[135px] px-[70px] mb-[176px] transition-opacity ease-in duration-700
              xl:mt-[60px] xl:px-[50px] xl:mb-[100px]
              laptop:px-[20px]
              tablet:mt-[40px] tablet:mb-[60px]
              mobile:px-[5px]
              ${isVisible1 ? "opacity-100" : "opacity-0"}`}
          >
            <TattooViewer />
          </section>
          {/* <Footer /> */}
        </section>
        </GuidanceProvider>
      </DecalMeshesProvider>
    </StepsProvider>
  );
};

export default ThreeDimView;
