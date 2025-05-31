"use client";
import { usePathname } from "next/navigation";
import Image from "next/image"; // Import the Image component
import Link from "next/link";


const protectedRoutes = ["/dashboard", "/settings", "/artist", "/subscription", "/leads", "/tattoo-viewer",];

const Demo = () => {
    const path = usePathname();
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));

    if (isProtectedRoute) {
        return null
    }

    if(path === "/tattoo-viewer") {
        return null;
    }
    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Link href="/tattoo-viewer">
                <div className="group relative" title="Try the demo">
                    <Image
                    src="/demo_grey.png" // Default image
                    width={80}
                    height={80}
                    alt="Demo"
                    className="text-white transition-opacity duration-200 group-hover:opacity-0"
                    />
                    <Image
                    src="/demo_black.png" // Hover image
                    width={80}
                    height={80}
                    alt="Demo"
                    className="text-white absolute top-0 left-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    />
                </div>
            </Link>
        </div>
    )
}

export default Demo;