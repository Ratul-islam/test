"use client";
import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaPhone } from "react-icons/fa6";
import { FiMail } from "react-icons/fi";

const Footer = () => {
  return (
    <footer
      className={`w-full md:px-14 px-4 py-8 flex flex-col gap-5 items-center justify-center bg-gradient-to-b from-[#fae6db] to-[#f1f8fe] text-[#6e6e6e]`}
    >
      {/* Main Content */}
      <div className='w-full flex flex-col gap-6'>
        {/* -- MOBILE: Logo only, centered (NO SOCIALS here) -- */}
        <div className="flex md:hidden w-full justify-center items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" width={30} height={30} alt="logo" />
            <h1 className="font-semibold text-xl tracking-wider">
              PRIC&apos;D
            </h1>
          </Link>
        </div>

        {/* -- DESKTOP: Logo centered, Nav shifted right, Socials right -- */}
        <div className="hidden md:flex w-full flex-row items-center relative">
          {/* Center group: Logo and Navs */}
          <div className="flex flex-row items-center justify-center w-full relative">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" width={30} height={30} alt="logo" />
              <h1 className="font-semibold text-xl tracking-wider">
                PRIC&apos;D
              </h1>
            </Link>
            {/* Nav Links shifted right */}
            <div className="flex flex-row items-center gap-8 ml-12">
              {/* About */}
              <div className="flex flex-col gap-0.5 items-center min-w-[80px]">
                <h5 className="text-[#449cfe] text-base font-medium">About</h5>
                <Link href="/about-us" className="text-sm hover:underline">About Us</Link>
              </div>
              {/* Support */}
              <div className="flex flex-col gap-0.5 items-center min-w-[80px]">
                <h5 className="text-[#449cfe] text-base font-medium">Support</h5>
                <Link href="/contact-us" className="text-sm hover:underline">Contact Us</Link>
              </div>
              {/* Contact */}
              <div className="flex flex-col gap-0.5 items-center min-w-[80px]">
                {/* <h5 className="text-[#449cfe] text-base font-medium">Contact</h5> */}
                <div className="flex items-center gap-1">
                  <FaPhone className="text-sm" />
                  <p className="text-sm">+(65) 6871 8846</p>
                </div>
                <div className="flex items-center gap-1">
                  <FiMail className="text-base" />
                  <p className="text-sm">hello@pricd.co</p>
                </div>
              </div>
            </div>
          </div>
          {/* Social Icons right */}
          <div className="flex items-center gap-4 text-black ml-auto">
            <Link href="https://www.facebook.com" target="_blank" className="hover:opacity-80"><FaFacebook className="w-6 h-7" /></Link>
            <Link href="https://www.linkedin.com" target="_blank" className="hover:opacity-80"><FaLinkedin className="w-6 h-7" /></Link>
            <Link href="https://www.instagram.com" target="_blank" className="hover:opacity-80"><FaInstagram className="w-6 h-7" /></Link>
          </div>
        </div>

        {/* -- MOBILE: Nav links & Contact centered -- */}
        <div className="md:hidden flex flex-col items-center w-full gap-4">
          <div className="flex gap-10 justify-center w-full">
            {/* About */}
            <div className="flex flex-col gap-1 items-center min-w-[80px]">
              <h5 className="text-[#449cfe] text-base font-medium">About</h5>
              <Link href="/about-us" className="text-sm hover:underline">About Us</Link>
            </div>
            {/* Support */}
            <div className="flex flex-col gap-1 items-center min-w-[80px]">
              <h5 className="text-[#449cfe] text-base font-medium">Support</h5>
              <Link href="/contact-us" className="text-sm hover:underline">Contact Us</Link>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-center mt-2">
            <h5 className="text-[#449cfe] text-base font-medium">Contact</h5>
            <div className="flex items-center gap-2">
              <FaPhone className="text-sm" />
              <p className="text-sm">+(65) 6871 8846</p>
            </div>
            <div className="flex items-center gap-2">
              <FiMail className="text-base" />
              <p className="text-sm">hello@pricd.co</p>
            </div>
          </div>
        </div>
      </div>

      {/* -- MOBILE: Social Icons above PRIC'D text -- */}
      <div className="flex md:hidden items-center justify-center gap-4 text-black mt-2">
        <Link href="https://www.facebook.com" target="_blank" className="hover:opacity-80"><FaFacebook className="w-6 h-7" /></Link>
        <Link href="https://www.linkedin.com" target="_blank" className="hover:opacity-80"><FaLinkedin className="w-6 h-7" /></Link>
        <Link href="https://www.instagram.com" target="_blank" className="hover:opacity-80"><FaInstagram className="w-6 h-7" /></Link>
      </div>

      {/* Brand name */}
      <h1 className='md:text-[12rem] text-7xl w-full text-center tracking-wider font-bold mt-8 md:mt-10'>
        PRIC&apos;D
      </h1>

      {/* Footer bottom */}
      <div className="flex flex-col md:flex-row w-full items-center justify-center gap-4 mt-4">
        <p className="text-sm tracking-wide font-semibold text-center">
          © 2025 PRIC&apos;D Copyright Reserved
        </p>
        <div className="flex flex-wrap items-center gap-4 justify-center">
          <Link
            href="/privacy-policy"
            className="text-sm font-semibold tracking-wide hover:underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-sm font-semibold tracking-wide hover:underline"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;