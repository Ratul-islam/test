import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/utils/authOptions";
import prisma from "@/app/utils/prismadb";

export type SafeAdmin = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  subscriptionStatus: string;
  subscriptionExpiry: string;
  depositPercentage: number;
  image?: string | null;
  createdAt: string;
};

export default async function getCurrentAdmin(): Promise<SafeAdmin | null> {
  try {
    const session = await getServerSession(authOptions);
    // console.log("🚀 ~ getCurrentAdmin ~ session:", session)

    if (!session?.user?.email) {
      return null;
    }

    const currentAdmin = await prisma.admin.findUnique({
      where: { email: session.user.email },
      // where: { email: "admin@admin.com" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        subscriptionStatus: true,
        subscriptionExpiry: true,
        depositPercentage: true,
        image: true,
        createdAt: true
      }
    });

    if (!currentAdmin) {
      return null;
    }

    return {
      ...currentAdmin,
      subscriptionExpiry: currentAdmin.subscriptionExpiry.toISOString(),
      createdAt: currentAdmin.createdAt.toISOString()
    };
  } catch (error) {
    console.error("Error in getCurrentAdmin:", error);
    return null;
  }
}
