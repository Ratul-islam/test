"use client";
import Image from "next/image";
import HeaderItem from "./headerItem";
import { useEffect, useRef, useState } from "react";
import useInView from "@/app/hooks/useVisible";
import { usePathname, useRouter } from "next/navigation";
import Modal from "./modal";
import Link from "next/link";
import { enableScroll } from "@/app/utils/scrollbar";

const languages = ["ENG", "Spanish", "German", "French", "Dutch", "Arabic"];
const Header = () => {
  const path = usePathname();
  const popUpRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedLanguege, setSelectedLanguege] = useState("ENG");
  const [showPopup, setShowPopup] = useState<boolean>();
  const [isVisible1, ref1] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (!popUpRef?.current?.contains(event.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () =>
      document.removeEventListener("click", handleClickOutside, true);
  }, []);

  return (
    <header
      ref={ref1}
      className={`bg-header bg-no-repeat w-full flex flex-col justify-between overflow-hidden
      px-[68px] text-white transition-opacity ease-in duration-700 relative
      xl:px-[10px]
      ${path === "/" ? "h-[1006px] tablet:h-[800px]" : "h-[441px]"}
      ${isVisible1 ? "opacity-100" : "opacity-0"}`}
    >
      <Link
        href='/'
        className='absolute z-10 cursor-pointer left-[65px] tablet:left-0 top-[-7px]'
      >
        <Image src='/logo.png' width={160} height={127} alt='logo' />
      </Link>

      <h1 className='capitalize text-[75px] tablet:text-[50px] tablet:text-center absolute bottom-[100px] left-0 right-0 flex justify-center'>
        {path.split('/')[1].replace(/[^a-zA-Z]+/g, " ")}
      </h1>

      <Image
  onClick={() => {
    setShowModal(true);
  }}
  src='mobile-menu.svg'
  width={40}
  height={40}
  alt='mobile-menu'
  className='absolute right-5 top-5 md:hidden'
/>
      <nav className='flex justify-between ml-10 pt-[20px]'>
      <ul className='pl-[150px] tablet:pl-30 relative pt-[20px] flex flex-row gap-x-[12px] text-[#f1f1f1] tracking-[0.1em] hidden md:flex'>
          <li className='hover:text-gray-500'>
            <Link href='/'>HOME</Link>
          </li>
          <li className='hover:text-gray-500'>
            <Link href='/tattoo-viewer'>DEMO</Link>
          </li>
          <li className='hover:text-gray-500'>
            <Link href='/contact-us'>CONTACT</Link>
          </li>
          <li className='hover:text-gray-500'>
            <Link href='/about-us'>ABOUT US</Link>
          </li>
          <li className='hover:text-gray-500'>
            <Link href='/inspirations'>INSPIRATIONS</Link>
          </li>
          <li className='hover:text-gray-500'>
            <Link href='/starting-your-free-trial'>
              STARTING YOUR FREE TRIAL
            </Link>
          </li>
        </ul>

        <ul className='flex items-start pt-[20px] gap-x-[40px] tablet:ml-auto xl:mr-10 laptop:ml-5 laptop:mr-5 tablet:pt-[10px] tablet:mr-[70px] tracking-[0.1em]'>
          <li
            onClick={() => setShowPopup(prev => !prev)}
            className='flex items-center gap-x-[6px] cursor-pointer'
          >
            {selectedLanguege}

            <div
              ref={popUpRef}
              className={`${showPopup ? "max-h-screen" : "max-h-0"} absolute duration-300 ease-in-out top-[70px] mobile:top-[55px] flex flex-col gap-y-[2px] overflow-hidden`}
            >
              {languages
                .filter(item => item != selectedLanguege)
                .map(item => (
                  <span
                    onClick={() => setSelectedLanguege(item)}
                    className='block hover:text-white/30'
                    key={item}
                  >
                    {item}
                  </span>
                ))}
            </div>
            <Image
              src='/arrow.svg'
              width={15}
              height={8}
              alt='Picture of the author'
            />
          </li>
          <li className='tablet:hidden cursor-pointer'>
            <Link href='/sign-up'>SIGN UP</Link>
          </li>
          <li className='tablet:hidden cursor-pointer'>
            <Link href='/sign-in'>SIGN IN</Link>
          </li>
        </ul>
      </nav>

      <div
        className={`flex pb-20 justify-between xl:pb-8 laptop:flex-col laptop:text-center tablet:mt-auto tracking-[0.1em]
        ${path === "/" ? "visible" : "invisible"}`}
      >
        <div className='pl-2'>
          <div
            className='w-[249px] h-[40px] rounded-[24px] flex items-center justify-between bg-white/10 border-[1px] border-grey/30
          laptop:mx-auto mobile:mb-1
          '
          >
            <span className='pl-4'>10k+ Client</span>
            <ul className='flex items-center pr-1'>
              <li>
                <Image width={30} height={30} src='/client1.svg' alt='client' />
              </li>
              <li>
                <Image width={30} height={30} src='/client2.svg' alt='client' />
              </li>
              <li>
                <Image width={30} height={30} src='/client3.svg' alt='client' />
              </li>
            </ul>
          </div>
          <button
            onClick={() => router.push("/starting-your-free-trial")}
            className='bg-white h-[81px] mobile:w-[300px] mobile:h-14 rounded-[91px] mt-4 hover:opacity-75 duration-300 mobile:mb-2 px-5 py-4'
          >
            <span className='text-[32px] font-second text-center text-black font-medium mobile:text-[20px]'>
              Start your free trial now
            </span>
          </button>
          <h2 className='text-[75px] xl:text-[40px] mobile:text-[24px]'>
            Start your 14 day Free Trial
          </h2>
          <p className='text-[38px] max-w-[849px] mt-3 mobile:mt-1 leading-[125%] xl:text-[28px] xl:max-w-[450px] laptop:mx-auto mobile:text-[20px] mobile:max-w-[340px]'>
            INCREASE YOUR SALES BY 80% TAKE INSTANT DEPOSITS REDUCE ADMIN TIME &
            STAFF COSTS
          </p>
        </div>

        <div className='flex items-end gap-x-5 mt-6 pb-[6px] pr-2 laptop:pr-0 laptop:mx-auto tablet:gap-x-2 mobile:flex-col mobile:gap-y-2'>
          <HeaderItem
            image='/dude1.png'
            text='For artists: no more back and forth with clients, they use the 3-d model to design and pay deposits . Ready for you to book them into your diary.'
          />
          <HeaderItem
            image='/tattoo_shop.jpg'
            maxW='max-w-[202px]'
            bottom='bottom-[-48px]'
            text='For studios: take away slow receptionists / admin roles, no more waiting for leads to turn cold. Customers book themselves in with a deposit.'
          />
        </div>
      </div>

      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='h-full w-full'>
          <button
            onClick={() => {
              enableScroll();
              setShowModal(false);
            }}
            aria-label='close Modal menu'
            className='absolute right-3 top-3 z-50 rounded-[50%] p-2 active:bg-green'
          >
            <Image
              src='/close-modal.svg'
              width={40}
              height={40}
              alt='close-modal'
            />
          </button>
          <nav className='relative flex h-screen items-center justify-center text-center text-[30px]'>
            <ul className='flex flex-col gap-y-5'>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/'>HOME</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/starting-your-free-trial'>DEMO</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/about-us'>ABOUT US</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/inspirations'>INSPIRATIONS</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/contact-us'>CONTACT US</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/sign-in'>Sign In</Link>
              </li>
              <li className='cursor-pointer items-center py-2'>
                <Link href='/sign-up'>Sign Up</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
