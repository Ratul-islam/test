/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import getCurrentAdmin from "@/app/actions/admin/getCurrentAdmin";
import getAllArtists from "@/app/actions/artists/getAllArtists";
import getArtistBySpecialisation from "@/app/actions/artists/getArtistBySpecialisation";

export async function GET(req: NextRequest) {
  try {

    const currentAdmin = await getCurrentAdmin();

    const { searchParams } = new URL(req.url);
    const adminId = req.headers.get('referer')?.split('/tattoo-viewer/')[1]?.split('?')[0]?.split('/')[0];
    if(searchParams.get("specialization")) {

      const artists = await getArtistBySpecialisation({adminId:adminId ||currentAdmin?.id || "", page:1, limit:100, specialization:searchParams.get("specialization") || ''});
      return NextResponse.json(artists, { status: 200 });
    }
    const artists = await getAllArtists({adminId:adminId || currentAdmin?.id || "", page:searchParams.get("page") || 1, limit:searchParams.get("limit") || 10, searchString:searchParams.get("searchString") || ''});
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

export async function POST(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can add artists." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const adminId = currentAdmin.id
    console.log("🚀 ~ POST ~ body:", body)
    const {
      name,
      email,
      phone,
      specialization,
      hourlyRate,
      rates // Contains tiny, small, medium, large, xl, xxl
    } = body;

    if (
      !adminId ||
      !name ||
      !email ||
      !phone ||
      !specialization ||
      !hourlyRate ||
      !rates ||
      typeof rates.tiny !== "number" ||
      typeof rates.small !== "number" ||
      typeof rates.medium !== "number" ||
      typeof rates.large !== "number" ||
      typeof rates.xl !== "number" ||
      typeof rates.xxl !== "number"
    ) {
      return NextResponse.json(
        { message: "All fields are required and must be valid." },
        { status: 400 }
      );
    }

    if (currentAdmin.id !== adminId) {
      return NextResponse.json(
        { message: "Forbidden. You can only add artists to your own account." },
        { status: 403 }
      );
    }

    const artist = await prisma.artist.create({
      data: {
        adminId,
        name,
        email,
        phone,
        specialization,
        hourlyRate,
        rates: {
          create: {
            tiny: rates.tiny,
            small: rates.small,
            medium: rates.medium,
            large: rates.large,
            xl: rates.xl,
            xxl: rates.xxl
          }
        }
      }
    });

    return NextResponse.json(artist, { status: 201 });
  } catch (error: any) {
    console.error("Error adding artist:", error.stack);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error adding artist." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while adding artist." },
      { status: 500 }
    );
  }
}
