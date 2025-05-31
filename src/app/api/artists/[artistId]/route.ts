import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import getCurrentAdmin from "@/app/actions/admin/getCurrentAdmin";
import { SafeArtist } from "@/app/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { artistId } = await params;

    if (!artistId) {
      return NextResponse.json(
        { message: "Artist ID is required." },
        { status: 400 }
      );
    }

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can view artist details." },
        { status: 401 }
      );
    }

    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        rates: true,
      },
    });

    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found." },
        { status: 404 }
      );
    }

    if (artist.adminId !== currentAdmin.id) {
      return NextResponse.json(
        { message: "Forbidden. You can only view artists under your account." },
        { status: 403 }
      );
    }

    const safeArtist: SafeArtist = {
      id: artist.id,
      name: artist.name,
      email: artist.email,
      phone: artist.phone,
      specialization: artist.specialization,
      hourlyRate: artist.hourlyRate,
      createdAt: artist.createdAt.toISOString(),
      adminId: artist.adminId,
      rates: artist.rates
        ? {
            id: artist.rates.id,
            tiny: artist.rates.tiny,
            small: artist.rates.small,
            medium: artist.rates.medium,
            large: artist.rates.large,
            xl: artist.rates.xl,
            xxl: artist.rates.xxl,
          }
        : null,
    };

    return NextResponse.json(safeArtist, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching artist details:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error fetching artist details." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while fetching artist details." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { artistId } = await params;

    if (!artistId) {
      return NextResponse.json(
        { message: "Artist ID is required." },
        { status: 400 }
      );
    }

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can update artist details." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone, specialization, hourlyRate, rates } = body;

    if (!name || !email || !phone || !specialization || !hourlyRate || !rates) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 }
      );
    }

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });

    if (!artist || artist.adminId !== currentAdmin.id) {
      return NextResponse.json(
        { message: "Forbidden. You can only update artists under your account." },
        { status: 403 }
      );
    }

    const updatedArtist = await prisma.artist.update({
      where: { id: artistId },
      data: {
        name,
        email,
        phone,
        specialization,
        hourlyRate,
        rates: {
          update: {
            tiny: rates.tiny,
            small: rates.small,
            medium: rates.medium,
            large: rates.large,
            xl: rates.xl,
            xxl: rates.xxl,
          },
        },
      },
    });

    return NextResponse.json(updatedArtist, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating artist:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error updating artist." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while updating artist." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Record<string, string>> }
) {
  try {
    const { artistId } = await params;

    if (!artistId) {
      return NextResponse.json(
        { message: "Artist ID is required." },
        { status: 400 }
      );
    }

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { message: "Unauthorized. Only admins can delete artists." },
        { status: 401 }
      );
    }

    const artist = await prisma.artist.findUnique({ where: { id: artistId } });

    if (!artist) {
      return NextResponse.json(
        { message: "Artist not found." },
        { status: 404 }
      );
    }

    if (artist.adminId !== currentAdmin.id) {
      return NextResponse.json(
        { message: "Forbidden. You can only delete artists under your account." },
        { status: 403 }
      );
    }
    await prisma.tattooRates.deleteMany({ where: { artistId } });
    await prisma.artist.delete({ where: { id: artistId } });

    return NextResponse.json({ message: "Artist deleted successfully." }, { status: 200 });
  } catch (error: unknown) {

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error deleting artist." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while deleting artist." },
      { status: 500 }
    );
  }
}
