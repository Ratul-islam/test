"use client";
import AboutUsComponent from "@/app/components/home/about-us";
import React from "react";
import Hero from "./components/home/Hero";
import HowWeWork from "./components/home/HowWeWork";
import DesignPlacement from "./components/home/DesignPlacement";
import ViewInspiration from "./components/home/ViewInspiration";
import GetTrial from "./components/home/GetTrial";
import Stats from "./components/Stats";

export default function Home() {
  return (
    <section className='flex relative flex-col w-full overflow-x-hidden'>
      <Hero />
      <AboutUsComponent />
      <HowWeWork />
      <Stats />
      <DesignPlacement />
      <ViewInspiration />
      <GetTrial />
      {/* 3D Design Placement: Visualize Before You Commit */}
      {/* <section
          ref={ref4}
          className={`mt-[100px] laptop:mt-[100px] tablet:mt-[60px] mobile:mt-[30px] transition-opacity ease-in duration-700 ${isVisible4 ? "opacity-100" : "opacity-0"} `}
        >
          <Image
            src='/3d.png'
            className='mobile:scale-150'
            alt='3d'
            width={1920}
            height={304}
          />

          <div className='flex laptop:flex-col'>
            <Image
              unoptimized={true}
              src='/tattoo-gifs.gif'
              alt='image'
              width={960}
              height={960}
              className='laptop:w-full h-[960px] w-[960px] laptop:h-[800px] tablet:h-[460px] mobile:h-[350px]'
            />
            <div className='w-[960px] laptop:w-fit laptop:h-fit laptop:mx-auto laptop:text-center h-[960px] px-[42px] pt-[55px] laptop:px-5 laptop:pt-5 tablet:items-center tablet:text-center flex flex-col justify-between tablet:mx-auto'>
              <div>
                <h4 className='text-[80px] xl:text-[60px] leading-[124%] tablet:text-[40px] mobile:text-[28px] tracking-[-0.03em]'>
                  3D Design Placement: <br /> Visualize Before You Commit
                </h4>
                <p className='text-[26px] mobile:text-[16px] laptop:text-[20px] leading-[120%] laptop:mx-auto mt-5 ml-1 max-w-[470px] tracking-wide'>
                  &quot;Visualize tattoos with our 3D tool. Upload your design
                  or choose a spot to see how it&apos;ll look before
                  booking.&quot;
                </p>
              </div>

              <button
                onClick={() => router.push("/starting-your-free-trial")}
                className='text-[18px] mobile:text-[16px] h-[52px] mobile:h-[38px] w-full border-black/50 border-[1px] xl:mt-10 '
              >
                GET STARTED NOW
              </button>
            </div>
          </div>
        </section> */}
      {/* gallery */}
      {/* <section
          ref={ref5}
          className={`mt-[170px] tablet:mt-[80px] mb-[665px] tablet:mb-[400px] mobile:mb-[250px] relative transition-opacity ease-in duration-700 ${isVisible5 ? "opacity-100" : "opacity-0"} `}
        >
          <Image src='/gallery1.png' alt='gellery1' width={1939} height={412} />
          <div className='absolute bottom-[-470px] tablet:bottom-[-300px] mobile:bottom-[-150px]'>
            <Image
              src='/gallery2.png'
              alt='gellery1'
              width={1939}
              height={412}
            />
          </div>
          <Link
            href='/inspirations'
            className='absolute top-[395px] xl:top-[200px] tablet:top-[100px] mobile:top-[60px] bg-contain group flex-col pb-8 pl-[42px] text-white left-0 right-0 mx-auto
        h-[462px] w-[652px] flex bg-gallery bg-no-repeat
        tablet:h-[300px] tablet:w-[400px]
        mobile:h-[250px] mobile:w-[300px]'
          >
            <div className='h-[100%] w-[100%] tablet:h-[285px] mobile:h-[210px] right-0 absolute hover:bg-black group-hover:bg-black duration-1000 z-10'></div>
            <span
              className='text-[40px] absolute bottom-20 invisible text-white z-20 duration-300 select-none
           group-hover:visible group-hover:text-center
           group-hover:translate-x-[130px] group-hover:translate-y-[-120px]
           tablet:text-[20px]
           tablet:group-hover:translate-x-[80px]
           tablet:group-hover:translate-y-[-60px]
           mobile:group-hover:translate-x-[30px]
           mobile:group-hover:translate-y-[-50px]
           '
            >
              VIEW INSPIRATION
            </span>
            <div
              className='mt-auto group-hover:translate-x-[150px] group-hover:translate-y-[-150px]
           duration-500 group-hover:opacity-0 group-hover:invisible
           mobile:pb-4
            tablet:group-hover:translate-x-[40px]
            tablet:group-hover:translate-y-[-40px]'
            >
              <div className='w-[168px] h-[25px] mb-[20px] bg-white/30 border-[0.64px] pl-[10px] pr-[3px] items-center justify-between border-white/50 flex rounded-[50px]'>
                <span className='text-[9px]'>Inspiration section</span>
                <div className='flex items-center'>
                  <Image
                    src='/client1.svg'
                    width={18}
                    height={18}
                    alt='client'
                  />
                  <Image
                    src='/client2.svg'
                    width={18}
                    height={18}
                    alt='client'
                  />
                  <Image
                    src='/client3.svg'
                    width={18}
                    height={18}
                    alt='client'
                  />
                  <div className='h-[18px] w-[18px] bg-white text-[12px] text-black rounded-[50%] flex items-center justify-center'>
                    +
                  </div>
                </div>
              </div>
              <span className='text-[31px] tablet:text-[20px] mobile:text-[16px] leading-[138%]'>
                See what recent customers <br /> created using our app
              </span>
            </div>
          </Link>
        </section> */}
    </section>
  );
}
