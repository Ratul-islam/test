// app/components/LayoutWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Nav from "@/app/components/Nav";
import Footer from "@/app/components/footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hiddenRoutes = ["/artists", "/leads", "/subscription", "/settings", "/dashboard"];

  const shouldHideLayout = hiddenRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  return (
    <>
      {!shouldHideLayout && <Nav />}
      {children}
      {!shouldHideLayout && <Footer />}
    </>
  );
}
