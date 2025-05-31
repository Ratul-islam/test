import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";

// Update the interface to match Prisma's return types
interface ContactQuery {
  id: string;
  name: string;
  email: string;    
  reason: string;
  query: string;
  createdAt: Date;
  updatedAt: Date;
  reason_for_cancel?: string | null;  // Make it optional and allow null
  subscriptionStatus?: string | null; // Make it optional and allow null
}

interface Pagination {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}

interface ResponseData {
  success: boolean;
  message: string;
  data: ContactQuery[] | null;
  pagination: Pagination | null;
}

export const POST = async (req: NextRequest) => {
  const responseData: ResponseData = {
    success: false,
    message: "",
    data: null,
    pagination: null,
  };

  try {
    const body = await req.json();
    const { name, email, reason, query } = body;

    // Validate input
    if (!name || !email || !reason || !query) {
      responseData.message = "All fields are required.";
      return NextResponse.json(responseData, { status: 400 });
    }

    // Additional validation for cancellation requests
    if (reason === "cancel_subscription" && !body.reason_for_cancel) {
      responseData.message = "Cancellation reason is required.";
      return NextResponse.json(responseData, { status: 400 });
    }

    // Save contact query to the database
    const contactQuery = await prisma.contactQuery.create({
      data: {
        name,
        email,
        reason,
        query,
        ...(reason === "cancel_subscription" && {
          reason_for_cancel: body.reason_for_cancel,
          subscriptionStatus: "PENDING"
        })
      },
    });

    responseData.success = true;
    responseData.message = "Your message has been sent successfully!";
    responseData.data = [contactQuery];
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error("Error saving contact query:", error);
    responseData.message = "Failed to submit your message.";
    return NextResponse.json(responseData, { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  const responseData: ResponseData = {
    success: false,
    message: "",
    data: null,
    pagination: null,
  };

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("perPage") || "10", 10);
    const sort = searchParams.get("sort") || "desc";
    const reason = searchParams.get("reason");

    const whereClause = reason ? { reason } : {};

    const [contactQueries, totalQueries] = await Promise.all([
      prisma.contactQuery.findMany({
        where: whereClause,
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: {
          createdAt: sort === "asc" ? "asc" : "desc",
        },
      }),
      prisma.contactQuery.count({
        where: whereClause,
      }),
    ]);

    // Transform the data to ensure compatibility
    const transformedData = contactQueries.map(query => ({
      ...query,
      reason_for_cancel: query.reason_for_cancel || undefined,
      subscriptionStatus: query.subscriptionStatus || undefined
    }));

    responseData.success = true;
    responseData.data = transformedData;
    responseData.pagination = {
      total: totalQueries,
      currentPage: page,
      perPage: perPage,
      totalPages: Math.ceil(totalQueries / perPage),
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("Error fetching contact queries:", error);
    responseData.message = "Failed to fetch contact queries.";
    return NextResponse.json(responseData, { status: 500 });
  }
};