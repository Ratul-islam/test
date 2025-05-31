"use client";
import AboutUsHero from "../components/AboutUs/AboutUsHero";
import StreamlinedBooking from "../components/AboutUs/StreamlinedBooking";
import EffortLessBooking from "../components/AboutUs/EffortLessBooking";
import Brands from "../components/AboutUs/Brands";
import Support from "../components/AboutUs/Support";
import Stats from "../components/Stats";

export default function AboutUs() {
  return (
    <section className='flex relative flex-col w-full overflow-x-hidden'>
      <AboutUsHero />
      <Stats />
      <StreamlinedBooking />
      <EffortLessBooking />
      <Brands />
      <Support />
      {/* <section
        ref={ref1}
        className={`mt-[195px] laptop:mt-[100px] mobile:mt-[60px] transition-opacity ease-in duration-700 ${isVisible1 ? "opacity-100" : "opacity-0"}`}
      >
        <Image
          src='/3d.png'
          width={1920}
          height={304}
          alt='3d'
          layout='responsive'
        />
      </section> */}

      {/* <section
        ref={ref2}
        className={`mt-[200px] px-[70px] flex items-center gap-x-[35px] transition-opacity ease-in duration-700
          laptop:flex-col laptop:gap-y-10 laptop:mt-[100px]
          tablet:mt-[60px] tablet:px-[20px] mobile:px-[10px]
          ${isVisible2 ? "opacity-100" : "opacity-0"}`}
      >
        <div>
          <Image src='/shoulder.png' width={1015} height={629} alt='shoulder' />
        </div>
        <p className='max-w-[730px] laptop:max-w-full laptop:text-center text-[30px] leading-[153%]'>
          {`Artists working in a tattoo studio: the problems we have as artists
          trying to tattoo and maintain bookings can be hard, we spend many
          hours going back and forth qualifying leads and potential customers
          but now with the Pric'd app, you can just focus on tattooing and the
          art.`}
        </p>
      </section> */}

      {/* <section
        ref={ref3}
        className={`mt-[200px] px-[70px] flex items-center gap-x-[35px] transition-opacity ease-in duration-700
          laptop:flex-col-reverse laptop:gap-y-10 laptop:mt-[100px]
          tablet:mt-[60px] tablet:px-[20px] mobile:px-[10px]
          ${isVisible3 ? "opacity-100" : "opacity-0"}`}
      >
        <p className='max-w-[730px] laptop:max-w-full laptop:text-center text-[30px] leading-[153%]'>
          Clients should also be able to leave artists reviews in the app after
          a tattoo to build up their portfolio.
        </p>
        <div className='border shadow-md'>
          <Image src='/tatto.png' width={1015} height={629} alt='tatto' />
        </div>
      </section> */}
      {/* <section
        ref={ref4}
        className={`bg-[#f7f8f9] mt-[120px] tablet:mt-[60px] transition-opacity ease-in duration-700 ${isVisible4 ? "opacity-100" : "opacity-0"}`}
      >
        <Image
          className='mx-auto'
          src='/brands.png'
          width={1126}
          height={435}
          alt='brands'
        />
      </section> */}
      {/* <section
        ref={ref5}
        className={`mt-[120px] tablet:mt-[60px] bg-cover bg-hands bg-no-repeat w-full h-[479px] text-white transition-opacity ease-in duration-700 ${isVisible5 ? "opacity-100" : "opacity-0"}`}
      >
        <p className='text-[38px] tablet:text-[28px] px-[20px] text-center leading-[174%] mt-[110px]'>
          If you need any assistance, feel free to reach out to our support team
          by <br /> clicking the button below:
        </p>
        <button
          onClick={() => router.push("contact-us")}
          className='text-[36px] tablet:text-[28px] tablet:h-[70px] tablet:mt-10 text-center h-[102px] w-[348px] bg-white rounded-[91px] text-black mx-auto mt-6 flex justify-center items-center'
        >
          Contact Support
        </button>
      </section> */}
    </section>
  );
}
