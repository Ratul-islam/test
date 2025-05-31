/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import SubscriptionCancellationNotice from "./subscriptionCancelationNotice";

interface Props {
  fullSidebar: boolean;
  setFullSidebar: Dispatch<SetStateAction<boolean>>;
}

type NavigationItem = {
  name: string;
  path: string;
  icon: string;
  roles: ("ADMIN" | "ARTIST" | "STUDIO"| "UNSELECTED")[];
};

const Sidebar: React.FC<Props> = ({ fullSidebar, setFullSidebar }) => {
  const path = usePathname();
  const { data: session }: any = useSession();
  const [showCancellationNotice, setShowCancellationNotice] = useState(
    session?.subscriptionStatus === "CANCELATIONINPROGRESS" || session?.subscriptionStatus === "PENDING"
  );
  const [userRole, setUserRole] = useState<"ADMIN" | "ARTIST" | "STUDIO" | "UNSELECTED">("STUDIO");

  const handleCancellationRemoved = () => {
    setShowCancellationNotice(false);
  };

  useEffect(() => {
    if (session?.user) {
      setShowCancellationNotice(session.user.subscriptionStatus === "CANCELATIONINPROGRESS" || session.user?.subscriptionStatus === "PENDING");
      // Set user role based on the userType from session
      setUserRole(session.user.userType);
    }
  }, [session]);

  // Define all possible navigation items with their access rules
  const allNavigations: NavigationItem[] = [
    {
      name: "overview",
      path: "/dashboard",
      icon: "overview",
      roles: ["ARTIST", "STUDIO"] // ADMIN doesn't have overview
    },
    {
      name: "leads",
      path: "/leads",
      icon: "leads",
      roles: ["ARTIST", "STUDIO"] // ADMIN doesn't have leads
    },
    {
      name: "artists",
      path: "/artists",
      icon: "artists",
      roles: ["STUDIO"] // Only STUDIO has artists
    },
    {
      name: "inquiries",
      path: "/inquiries",
      icon: "Inqueries",
      roles: ["ADMIN"] // Only ADMIN has inquiries
    },
    {
      name: "subscription",
      path: "/subscription",
      icon: "subscription",
      roles: ["ARTIST", "STUDIO"] // ADMIN doesn't have subscription
    },
    {
      name: "settings",
      path: "/settings",
      icon: "settings",
      roles: ["ADMIN", "ARTIST", "STUDIO"] // All roles have settings
    },
    {
      name: "finish signup",
      path: "/finish-signup",
      icon: "subscription",
      roles: ["UNSELECTED"] // All roles have settings
    }
  ];

  // Filter navigation items based on user role
  const navigations = allNavigations.filter(item => item.roles.includes(userRole));

  return (
    <aside
      className={`${fullSidebar ? "w-[70px] px-4 py-8" : "w-[280px] xl:w-[230px] laptop:w-[170px] tablet:w-[50px] py-7 px-4 laptop:px-2 "}
    h-screen fixed py-[20px] px-[16px] bg-white shadow-xl transition-all duration-300 overflow-hidden`}
    >
      <div className='flex flex-col justify-between h-full'>
        <div>
          <div className='flex items-center border-b border-[#ececed] pb-4'>
            {!fullSidebar && (
              <>
                <Image
                  src='/dashboard/icon.png'
                  width={60}
                  height={53}
                  alt='logo'
                  className='tablet:hidden'
                />
                <span className='text-[25px] laptop:hidden font-bold ml-3 tracking-wider'>
                  {`Pric'd`}
                </span>
              </>
            )}
            <Image
              width={24}
              height={25}
              src='dashboard/sidebar-icon.svg'
              alt='sidebar-icon'
              className={`${fullSidebar ? "mx-auto" : "ml-auto"} cursor-pointer tablet:mx-auto`}
              onClick={() => setFullSidebar(prev => !prev)}
            />
          </div>

          <div className='mt-6 p-2 h-[64px] bg-[#ececec] flex items-center tablet:h-[48px] tablet:p-1'>
            <Image
              height={43}
              width={44}
              alt='box'
              src='dashboard/box-icon.svg'
            />
            {!fullSidebar && (
              <>
                <span className='font-second ml-4 font-semibold text-[20px] tracking-[-0.04em] tablet:hidden'>
                  {userRole === "ADMIN" ? "Admin" : userRole === "ARTIST" ? "Artist" : userRole === "STUDIO" ? "Studio" : "NEW"}
                </span>
                <Image
                  height={22}
                  width={21}
                  alt='arrow-down'
                  src='dashboard/double-arrow-down.svg'
                  className='ml-auto laptop:hidden'
                />
              </>
            )}
          </div>

          <nav className='my-6'>
            <ul>
              {navigations.map(item => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`capitalize text-[14px] text-black/75 ${path === item.path ? "font-extrabold" : "font-bold"}`}
                >
                  <li
                    className={`flex items-center leading-[171%] py-3 px-2 gap-x-4 rounded-[8px] cursor-pointer text-[14px] font-second
                  ${path === item.path ? "bg-gradient-to-b from-[#d9edff] to-[#f8f8f8]" : " hover:bg-black/5"}`}
                  >
                    <Image
                      src={`/dashboard/${item.icon}.svg`}
                      height={20}
                      width={20}
                      alt={item.name}
                    />
                    {!fullSidebar ? item.name : null}
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          {showCancellationNotice  && (
            <SubscriptionCancellationNotice
              expiry={session.user.subscriptionExpiry}
              email={session.user?.email}
              onCancellationRemoved={handleCancellationRemoved}
            />
          )}
        </div>

        <div
          onClick={() => signOut()}
          className='py-3 px-2 flex items-center gap-x-4 cursor-pointer hover:bg-black/5 rounded-[8px]'
        >
          <Image
            src='/dashboard/logout.svg'
            height={20}
            width={20}
            alt='logout'
          />
          <span className='font-bold font-second text-[14px] text-black/75 tablet:hidden'>
            Logout
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;