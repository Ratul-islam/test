// src/app/api/proxy/artists/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const paramsObj: Record<string, string> = {};
  
      // Only add params if they are non-empty strings
      for (const [key, value] of searchParams.entries()) {
        if (value && value.trim() !== "") {
          paramsObj[key] = value;
        }
      }
      const queryString = new URLSearchParams(paramsObj).toString();
  
      const response = await fetch(`https://www.pricd.co.uk/api/artists?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      console.error("Error proxying artists request:", error);
      return NextResponse.json(
        { error: "Failed to fetch artists" },
        { status: 500 }
      );
    }
  }