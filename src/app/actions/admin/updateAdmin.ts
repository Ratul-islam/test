/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/app/utils/prismadb";

interface IUpdateAdminParams {
  adminId: string;
  name?: string;
  phone?: string;
  image?: string;
  depositPercentage?: number;
}

export default async function updateAdmin(params: IUpdateAdminParams) {
  try {
    const { adminId, name, phone, depositPercentage, image } = params;
    
    const data = { name, phone, depositPercentage, ...(image && { image }), }

    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: data
    });

    return {
      ...updatedAdmin,
      subscriptionExpiry: updatedAdmin.subscriptionExpiry.toISOString(),
      createdAt: updatedAdmin.createdAt.toISOString()
    };
  } catch (error: any) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error updating admin profile.");
    }
    throw new Error(
      "An unknown error occurred while updating the admin profile."
    );
  }
}
