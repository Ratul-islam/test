// src/app/api/proxy/artists/specialization/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get("adminId") || "";
    
    const response = await fetch(`https://www.pricd.co.uk/api/artists/specialization?adminId=${adminId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying specialization request:", error);
    return NextResponse.json(
      { error: "Failed to fetch specializations" },
      { status: 500 }
    );
  }
}