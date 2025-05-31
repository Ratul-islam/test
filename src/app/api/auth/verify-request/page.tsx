// src/app/auth/verify-request/page.tsx

"use client";

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyRequest() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className='border-2 w-[120px] h-[120px] mx-auto flex items-center justify-center rounded-[50%] border-black mb-6'>
          <Image
            src='/email.svg'
            height={44}
            width={44}
            alt='email icon'
            className="mx-auto"
          />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Check your email</h1>
        
        <p className="mb-6 text-gray-600">
          We&apos;ve sent a magic link to <span className="font-semibold">{email}</span>.
          <br />Click the link in the email to sign in.
        </p>
        
        <div className="mt-8">
          <Link 
            href="/sign-in"
            className="text-black font-medium hover:underline"
          >
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}