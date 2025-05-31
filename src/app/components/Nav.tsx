"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Modal from "./modal";
import { enableScroll } from "../utils/scrollbar";

const Nav = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className='w-full md:px-14 px-8 py-4 flex items-center justify-between bg-bgPrimary2 border-b border-[#E1E1E1]'>
      <Link
        href='/'
        className='cursor-pointer flex items-center gap-2 md:w-auto lg:w-[15%]'
      >
        <Image src='/logo.png' width={20} height={30} alt='logo' />
        <h1 className='font-semibold text-xl tracking-wider'>PRIC&apos;D</h1>
      </Link>

      <ul className='flex items-center justify-center md:gap-4 lg:gap-8 text-base hidden md:flex md:w-[70%] lg:w-[65%]'>
        <li className="md:ml-6 lg:ml-0">
          <Link href='/'>Home</Link>
        </li>
        <li>
          <Link href='/tattoo-viewer'>Demo</Link>
        </li>
        <li>
          <Link href='/inspirations'>Inspirations</Link>
        </li>
        <li>
          <Link href='/about-us'>About Us</Link>
        </li>
        <li>
          <Link href='/starting-your-free-trial'>Free Trial</Link>
        </li>
        <li>
          <Link href='/contact-us'>Contact Us</Link>
        </li>
      </ul>

      <div className='flex items-center justify-end gap-2 float-right md:w-auto lg:w-[20%] relative'>
        {/* <button className='px-3 py-1 rounded-xl text-white text-sm bg-black cursor-pointer '>
          Book a Demo
        </button> */}
      <Link href='/sign-in'>
        <button className='px-3 py-1 rounded-xl text-black text-base bg-white cursor-pointer '>
          Sign in
        </button>
      </Link>
        <Image
          onClick={() => {
            setShowModal(true);
          }}
          src='mobile-menu.svg'
          width={30}
          height={30}
          alt='mobile-menu'
          className='invert md:hidden'
        />
      </div>

      <Modal showModal={showModal} setShowModal={setShowModal}>
        <div className='h-full w-full '>
          <button
            onClick={() => {
              enableScroll();
              setShowModal(false);
            }}
            aria-label='close Modal menu'
            className='absolute right-3 top-3 z-50 rounded-[50%] p-2 invert'
          >
            <Image
              src='/close-modal.svg'
              width={30}
              height={30}
              alt='close-modal'
            />
          </button>
          <nav className='relative flex h-screen items-center justify-center text-center text-[30px]'>
            <ul className='flex flex-col gap-y-5'>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/'>Home</Link>
              </li>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/tattoo-viewer'>Demo</Link>
              </li>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/inspirations'>Inspirations</Link>
              </li>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/about-us'>About Us</Link>
              </li>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/starting-your-free-trial'>Free Trial</Link>
              </li>
              <li
                onClick={() => {
                  enableScroll();
                  setShowModal(false);
                }}
                className='cursor-pointer items-center py-2'
              >
                <Link href='/contact-us'>Contact Us</Link>
              </li>
            </ul>
          </nav>
        </div>
      </Modal>
    </div>
  );
};

export default Nav;