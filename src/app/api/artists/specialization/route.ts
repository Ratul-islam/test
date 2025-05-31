/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import getSpecialisations from "@/app/actions/artists/getSpecialisations";

export async function GET(req: NextRequest) {
  try {

    const { searchParams } = new URL(req.url);

    const artists = await getSpecialisations({adminId:searchParams.get("adminId") || ''});
    return NextResponse.json(artists, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching leads:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message || "Error fetching leads." }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Unknown error occurred while fetching leads." },
      { status: 500 }
    );
  }
}