import { NextRequest, NextResponse } from "next/server";
import getArtistById from "@/app/actions/artists/getArtistById";

// Step 1: Match the area to a size category
function determineSizeCategory(area: number) {
  if (area <= 5) return "tiny";
  if (area <= 10) return "small";
  if (area <= 15) return "medium";
  if (area <= 20) return "large";
  if (area <= 25) return "xl";
  return "xxl";
}

// Step 2: Calculate price based on artist's rates
function calculatePrice(
  area: number,
  rates: Record<string, number>
): { price: number; sizeCategory: string } {
  const sizeCategory = determineSizeCategory(area);
  const basePrice = rates[sizeCategory];

  return { price: basePrice, sizeCategory };
}

// Step 3: Handle API Request
export async function POST(req: NextRequest) {
  try {
    const { artistId, decalArea } = await req.json();
    
    if (!artistId) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    const artist = await getArtistById({ artistId });
    if (!artist?.rates) {
      return NextResponse.json(
        { message: "Artist not found or rates unavailable." },
        { status: 404 }
      );
    }

    // Extract rates from the artist's profile
    const numericRates = {
      tiny: artist.rates.tiny,
      small: artist.rates.small,
      medium: artist.rates.medium,
      large: artist.rates.large,
      xl: artist.rates.xl,
      xxl: artist.rates.xxl,
    };

    // Calculate price
    const { price, sizeCategory } = calculatePrice(decalArea, numericRates);

    return NextResponse.json(
      { estimatedPrice: price, sizeCategory },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in price estimation:", error);
    return NextResponse.json({ message: "Server error." }, { status: 500 });
  }
}
