import prisma from "@/app/utils/prismadb";

interface GetArtistNamesByAdminParams {
  adminId: string;
  specialization: string;
  page?: number;
  limit?: number;
}

export default async function getArtistNamesByAdmin({
  adminId,
  specialization,
  page = 1,
  limit = 10,
}: GetArtistNamesByAdminParams): Promise<{ artists: object; pagination: object }> {
  try {
    const skip = (page - 1) * limit;

    const artists = await prisma.artist.findMany({
      where: {
        adminId,
        specialization,
      },
      select: {
        id: true,
        name: true,
      },
      skip,
      take: limit,
    });

    const total = await prisma.artist.count({
      where: {
        adminId,
        specialization,
      },
    });

    return {
      artists: artists.map((artist) => ({ id: artist.id, name: artist.name })),
      pagination: {
        total,
        currentPage: page,
        limit,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error fetching artist names for the admin.");
    }
    throw new Error("Unknown error occurred while fetching artist names.");
  }
}
