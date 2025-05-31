import prisma from "@/app/utils/prismadb";
import { SafeAdmin } from "@/app/types";

interface IParams {
  adminId: string;
}

export default async function getAdminById(
  params: IParams
): Promise<SafeAdmin | null> {
  try {
    const { adminId } = params;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return null;
    }

    return {
      ...admin,
      createdAt: admin.createdAt.toISOString(),
      subscriptionExpiry: admin.subscriptionExpiry.toISOString()
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error fetching admin profile.");
    }
    throw new Error("Unknown error occurred while fetching admin profile.");
  }
}
