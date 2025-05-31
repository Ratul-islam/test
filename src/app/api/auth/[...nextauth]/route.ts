import { authOptions } from "@/app/utils/authOptions";
import { DefaultSession } from "next-auth";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions);
declare module "next-auth" {
    interface Session {
      id: string; // <-- add this
      user: {
        id: string;
        userType?: string;
        subscriptionStatus?: string;
        depositPercentage?: number;
        autoRenew?: boolean;
        image?: string | null;
        subscriptionExpiry?: Date;
        trial?: boolean;
        artistsNum?: number;
      } & DefaultSession["user"];
    }
  
    interface User {
      id?: string;
      userType?: string;
      subscriptionStatus?: string;
      depositPercentage?: number;
      autoRenew?: boolean;
      subscriptionExpiry?: Date;
      trial?: boolean;
      artistsNum?: number;
    }
  }

export { handler as GET, handler as POST };