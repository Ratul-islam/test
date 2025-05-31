"use client";

import { SessionProvider } from 'next-auth/react';
import useInView from "@/app/hooks/useVisible";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthorizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isVisible1, ref1] = useInView({ threshold: 0.1 });
  const path = usePathname();

  return (
    <SessionProvider>
      <section
        ref={ref1}
        className={`bg-header bg-no-repeat h-screen w-screen bg-cover text-white transition-opacity ease-in duration-700 relative overflow-hidden ${isVisible1 ? "opacity-100" : "opacity-0"}`}
      >
        <div className='max-w-[651px] w-full h-full p-12 overflow-y-auto max-h-screen justify-between flex flex-col gap-y-5 float-right bg-white text-black mobile:p-4'>
          {/* Header */}
          <div className='flex items-center justify-between gap-x-5'>
            <div className='flex justify-between items-center w-full'>
              <Link href='/'>
                <div className="relative w-[60px] h-[60px]">
                  <Image
                    src='/logo.png'
                    fill
                    alt='logo'
                    priority
                    className="object-contain"
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                    }}
                  />
                </div>
              </Link>

              <div className="flex gap-2">
                <Link
                  className={`px-4 h-7 inline-flex items-center justify-center py-1 text-[12px] font-semibold rounded-[6px] transition-all
                    ${path === "/sign-in" ? "shadow-md border border-gray-300" : "opacity-50 hover:opacity-70"}`}
                  href='/sign-in'
                >
                  Sign In
                </Link>
                <Link
                  className={`px-4 h-7 inline-flex items-center justify-center py-1 text-[12px] font-semibold rounded-[6px] transition-all
                    ${path === "/sign-up" ? "shadow-md border border-gray-300" : "opacity-50 hover:opacity-70"}`}
                  href='/sign-up'
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>

          {/* Page Title */}
          <h2 className='font-semibold text-[20px] mt-6 capitalize'>
            {path?.slice(1).replace("-", " ") || ''}
          </h2>

          {/* Auth Form or Step Component */}
          {children}

          {/* Footer */}
          <span className='text-[12px] font-medium mt-auto block'>
            © Pricd.co.uk 2025 
          </span>
        </div>
      </section>
    </SessionProvider>
  );
}
