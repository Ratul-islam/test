/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import { Prisma } from "@prisma/client";

export const POST = async (res: NextRequest) => {
  try {
    const reqBody = await res.json();
    
    // Ensure cancellation requests have proper structure
    const data = {
      ...reqBody,
      // For cancellation requests, store the reason in the query field if not provided
      query: reqBody.reason === "cancel_subscription" 
        ? reqBody.query || reqBody.reason_for_cancel || "Subscription cancellation request"
        : reqBody.query
    };

    // Adding to DB
    const query = await prisma.contactQuery.create({ data });

    return NextResponse.json({
      message: "Query added to admin dashboard",
      query
    });
  } catch (error) {
    console.log("🚀 ~ Cancel Subscription ~ error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error creating lead." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while creating lead." },
      { status: 500 }
    );
  }
};

// In your API route (GET /api/queries)
export const GET = async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('perPage') || '10');
    const sortOrder = searchParams.get('sort') || 'desc';

    const findManyOptions: Prisma.ContactQueryFindManyArgs = {
      orderBy: { createdAt: sortOrder as 'asc' | 'desc' },
      take: perPage,
      skip: (page - 1) * perPage,
    };

    const countOptions: Prisma.ContactQueryCountArgs = {};

    // Updated search to only look at name and email fields
    if (search) {
      const whereClause: Prisma.ContactQueryWhereInput = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } } // Use equals for exact email match
        ]
      };
      
      findManyOptions.where = whereClause;
      countOptions.where = whereClause;
    }

    const total = await prisma.contactQuery.count(countOptions);
    const queries = await prisma.contactQuery.findMany(findManyOptions);

    const formattedQueries = queries.map(query => ({
      ...query,
      query: query.reason === "cancel_subscription" && !query.query
        ? query.reason_for_cancel || "Subscription cancellation request"
        : query.query,
      subscriptionStatus: query.subscriptionStatus || "INACTIVE"
    }));

    return NextResponse.json({
      success: true,
      message: "Queries retrieved successfully",
      data: formattedQueries,
      pagination: {
        total,
        currentPage: page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      },
    });

  } catch (error) {
    console.error("Error in GET /api/queries:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error 
          ? error.message 
          : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
};