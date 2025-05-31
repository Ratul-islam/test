// app/api/update-artists-num/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';
import prisma from '@/app/utils/prismadb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { numberOfArtists } = await req.json();

    const updatedAdmin = await prisma.admin.update({
      where: { email: session.user.email },
      data: {
        artistsNum: {
          increment: numberOfArtists, // Increment the current number of artists
        },
      },
    });

    return NextResponse.json({ artistsNum: updatedAdmin.artistsNum });
  } catch (error) {
    console.error('Error updating artists number:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}