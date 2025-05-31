/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

export const POST = async (req: NextRequest) => {
  // Initialize response data
  const responseData = {
    success: false,
    message: "",
    data: null
  };

  try {
    // 1. Safely get request body
    let requestBody;
    try {
      requestBody = await req.text();
    } catch (e) {
      responseData.message = "Failed to read request body";
      return NextResponse.json(responseData, { status: 400 });
    }

    // 2. Parse JSON with validation
    let parsedBody;
    try {
      parsedBody = requestBody ? JSON.parse(requestBody) : null;
    } catch (e) {
      responseData.message = "Invalid JSON format";
      return NextResponse.json(responseData, { status: 400 });
    }

    if (!parsedBody || typeof parsedBody !== 'object') {
      responseData.message = "Request body must be a JSON object";
      return NextResponse.json(responseData, { status: 400 });
    }

    // 3. Validate required fields
    const { userName, userEmail, reason } = parsedBody;
    if (!userName || !userEmail) {
      responseData.message = "User  name and email are required";
      return NextResponse.json(responseData, { status: 400 });
    }

    // 4. Verify user exists based on name and email
    try {
      const userExists = await prisma.admin.findUnique({
        where: { email: userEmail },
      });

      if (!userExists || userExists.name !== userName) {
        responseData.message = "User  not found or name does not match";
        return NextResponse.json(responseData, { status: 404 });
      }
    } catch (e) {
      responseData.message = "Database lookup failed";
      return NextResponse.json(responseData, { status: 500 });
    }

    // 5. Perform the update
    try {
      const updatedUser  = await prisma.admin.update({
        where: { email: userEmail },
        data: {
          subscriptionStatus: "CANCELATIONINPROGRESS",
          cancellationApprovalDate: new Date(),
          cancellationReason: reason || "Approved by admin",
          subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          autoRenew: false
        }
      });

      // 6. Return success
      responseData.success = true;
      responseData.message = "Cancellation approved successfully";

      return NextResponse.json(responseData, { status: 200 });

    } catch (e) {
      responseData.message = "Failed to update user record";
      return NextResponse.json(responseData, { status: 500 });
    }

  } catch (error) {
    // Global error handler
    console.error("Unexpected error:", error);
    responseData.message = "Internal server error";
    return NextResponse.json(responseData, { status: 500 });
  }
};