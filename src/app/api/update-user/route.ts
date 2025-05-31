// app/api/update-user/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/app/utils/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/authOptions';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userType, subscriptionStatus, trial } = await request.json();

  try {
    const updatedUser = await prisma.admin.update({
      where: { email: session.user.email },
      data: {
        ...(userType && { userType }),
        ...(subscriptionStatus && { subscriptionStatus }),
        ...(trial !== undefined && { trial })
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}