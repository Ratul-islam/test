import prisma from "@/app/utils/prismadb";

interface GetDistinctSpecializationsParams {
  adminId?: string;
}

export default async function getDistinctSpecializations({
  adminId,
}: GetDistinctSpecializationsParams): Promise<{ specializations: string[] }> {
  try {
    const where: GetDistinctSpecializationsParams = {}
    if (adminId) {
     where.adminId  = adminId
    }

    const specializations = await prisma.artist.findMany({
      where: where,
      distinct: ["specialization"],
      select: {
        specialization: true,
      },
    });

    const specializationList = specializations.map((artist) => artist.specialization);

    return {
      specializations: specializationList,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error fetching distinct specializations.");
    }
    throw new Error("Unknown error occurred while fetching distinct specializations.");
  }
}
