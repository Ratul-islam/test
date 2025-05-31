import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from 'next-auth/middleware'

import { withAuth } from 'next-auth/middleware'
import { differenceInDays, parseISO } from "date-fns";
// This function can be marked `async` if using `await` inside
// export function middleware(request: NextRequest) {
//   return NextResponse.redirect(new URL("/home", request.url));
// }


export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    // console.log("🚀 ~ middleware ~ isGuestRoute(request.nextUrl.pathname):", request.nextUrl.pathname)

    // if (!request.nextauth?.token && !isGuestRoute(request.nextUrl.pathname)) {
    //   return NextResponse.redirect(new URL('/sign-in', request.url));
    // }

    if (!request.nextauth?.token && isPrivateRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (request.nextauth?.token && isPrivateRoute(request.nextUrl.pathname)) {
      const { subscriptionExpiry, subscriptionStatus } = request.nextauth?.token;

      if (subscriptionStatus === "EXPIRED" && request.nextUrl.pathname !== '/subscription') {
        return NextResponse.redirect(new URL('/subscription', request.url));
      }

      if (subscriptionExpiry) {
        const expiryDate = subscriptionExpiry as string;
        const today = new Date();
        const expiry = parseISO(expiryDate);
        const diff = differenceInDays(expiry, today);

        if (diff < 1 && request.nextUrl.pathname !== '/subscription') {
          const response = NextResponse.redirect(new URL('/subscription', request.url));
          return response;
        }
      }
    }


    if (request.nextauth?.token && isGuestRoute(request.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => {
        return true
      }
    }
  }
)


const guestRoutes = ['/sign-in', '/sign-up']
function isGuestRoute(pathname: string) {
  return guestRoutes.some(route => pathname.includes(route))
}
const privateRoutes = ['/dashboard', '/leads', '/settings', '/subscription','/artists']
function isPrivateRoute(pathname: string) {
  return privateRoutes.some(route => pathname.includes(route))
}

// Function to check if a route is the root page
// function isRootPage(pathname: string) {
//   return pathname === '/'
// }

export const config = {
  // matcher: "/about/:path*"
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|header.png|cache-control.js|.*\\.svg$).*)"
    // ...guestRoutes,...privateRoutes`
    // "/dashboard/:path*", "/leads/:path*", "/settings/:path*", "/sign-in", "/sign-up"

  ]
};
