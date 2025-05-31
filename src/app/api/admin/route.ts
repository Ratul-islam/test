import { NextRequest, NextResponse } from "next/server";
import updateAdmin from "@/app/actions/admin/updateAdmin";
import getCurrentAdmin from "@/app/actions/admin/getCurrentAdmin";
import getAdminById from "@/app/actions/admin/getAdminById";
import path from 'path';
import fs from 'fs';


export async function PUT(req: NextRequest) {
  try {
    // Parse the FormData
    const formData = await req.formData();

    const adminId = formData.get('adminId') as string;
    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const depositPercentage = formData.get('depositPercentage') as string;
    const imageFile = formData.get('image') as File;

    let imageUrl = ''
    if (imageFile) {
      
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
  
      const fileName = `${Date.now()}-${imageFile.name}`;
      const filePath = path.join(uploadDir, fileName);
  
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      fs.writeFileSync(filePath, buffer);
  
      // Construct the image URL
      imageUrl = `/uploads/${fileName}`;
    }

    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json(
        { message: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
    }

    if (currentAdmin.id !== adminId) {
      return NextResponse.json(
        { message: 'Forbidden. You are not allowed to update this admin.' },
        { status: 403 }
      );
    }

    // Update the admin record with the new image URL
    const updatedAdmin = await updateAdmin({
      adminId,
      name,
      phone,
      depositPercentage: parseFloat(depositPercentage),
      image: imageUrl, // Save the image URL in the database
    });

    return NextResponse.json(updatedAdmin, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();

    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId");

    if(adminId) {
      const admin = await getAdminById({adminId});
      return NextResponse.json(admin, { status: 200 });
    }
    if (!currentAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(currentAdmin, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching admin:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message || "Error fetching leads." }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Unknown error occurred while fetching leads." },
      { status: 500 }
    );
  }
}