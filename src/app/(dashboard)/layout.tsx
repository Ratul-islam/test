"use client";
import TopBar from "@/app/components/dashboard/topbar";
import Sidebar from "@/app/components/dashboard/sidebar";
import { useState } from "react";
import { NextAuthProvider } from '@/app/contexts/nextAuthProvider'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [fullSidebar, setFullSidebar] = useState<boolean>(false);
  return (
    <NextAuthProvider>
      <section className='max-w-[1980px] mx-auto flex bg-[#f7f7f7]'>
        <Sidebar fullSidebar={fullSidebar} setFullSidebar={setFullSidebar} />

        <section
          className={`w-full pl-[275px] ${fullSidebar ? "pl-[70px]" : "pl-[280px] xl:pl-[230px] laptop:xl:pl-[170px] tablet:pl-[50px]"} overflow-hidden`}
        >
          <TopBar />
          {children}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </section>
      </section>
    </NextAuthProvider>
  );
}
