/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/app/utils/prismadb";
import { SafeArtist } from "@/app/types";
import { Artist, TattooRates } from "@prisma/client";

interface GetAllArtistsParams {
  adminId: string;
  page?: any;
  limit?: any;
  searchString?:string
}
export default async function getAllArtists({
  adminId,
  page = 1,
  limit = 10,
  searchString
}: GetAllArtistsParams): Promise<{ records: SafeArtist[]; pagination:object }> {
  try {

    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Fetch leads with pagination
    const artists = await prisma.artist.findMany({
      where: { adminId,
        OR: [
          { email: { contains: searchString } },
          { name: { contains: searchString } },
          { phone: { contains: searchString } }
        ]
       },
      include: {
        rates: true
      },
      skip,
      take: limit,
    });

    const total = await prisma.artist.count({
      where: { adminId,
        OR: [
        { email: { contains: searchString } },
        { name: { contains: searchString } },
        { phone: { contains: searchString } }
      ] 
    },
    });

    return {
      records: artists.map((artist: Artist & { rates: TattooRates | null }) => ({
      id: artist.id,
      name: artist.name,
      email: artist.email,
      phone: artist.phone,
      adminId: artist.adminId,
      specialization: artist.specialization,
      hourlyRate: artist.hourlyRate,
      createdAt: artist.createdAt.toISOString(),
      rates: artist.rates
        ? {
            id: artist.rates.id,
            tiny: artist.rates.tiny,
            small: artist.rates.small,
            medium: artist.rates.medium,
            large: artist.rates.large,
            xl: artist.rates.xl,
            xxl: artist.rates.xxl
          }
        : null
    })),
    pagination: {
      total,
      currentPage: page,
      limit,
    }
  }
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error fetching artists.");
    }
    throw new Error("Unknown error occurred while fetching artists.");
  }
}
