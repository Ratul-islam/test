import prisma from "@/app/utils/prismadb";

interface IParams {
  artistId: string;
}

export default async function getArtistById(params: IParams) {
  try {
    const { artistId } = params;

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        rates: true
      }
    });

    if (!artist) {
      return null;
    }

    return {
      ...artist,
      createdAt: artist.createdAt.toISOString(),
      rates: artist.rates ? { ...artist.rates } : null
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Error fetching artist details.");
    }
    throw new Error("An unknown error occurred while fetching artist details.");
  }
}
