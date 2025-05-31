/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/app/utils/prismadb";
import { SafeLead } from "@/app/types";

interface GetAllLeadsParams {
  adminId: string;
  page?: any;
  limit?: any;
  orderBy?: string;
  searchString?: string;
}

export default async function getAllLeads({
  adminId,
  page = 1,
  limit = 10,
  orderBy,
  searchString
}: GetAllLeadsParams): Promise<{ records: SafeLead[]; pagination: object }> {
  try {
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Fetch leads with pagination
    const leads = await prisma.lead.findMany({
      where: {
        adminId,
        OR: [
          { email: { contains: searchString } },
          { clientName: { contains: searchString } }
        ]
      },
      include: {
        tattooRequests: true,
        Booking: true
      },
      orderBy: {
        createdAt: orderBy === "desc" ? "desc" : "asc"
      },
      skip,
      take: limit
    });

    // Count total records for pagination metadata
    const total = await prisma.lead.count({
      where: { adminId }
    });

    return {
      records: leads.map(lead => ({
        ...lead,
        createdAt: lead.createdAt.toISOString(),
        adminId: lead.adminId,
        selectedArtistId: lead.selectedArtistId || null,
        tattooRequests: lead.tattooRequests.map(request => ({
          ...request,
          createdAt: request.createdAt.toISOString()
        })),
        Booking: lead.Booking.map(booking => ({
          ...booking,
          createdAt: booking.createdAt.toISOString()
        }))
      })),
      pagination: {
        total,
        currentPage: page,
        limit
      }
    };
  } catch (error: any) {
    console.error("Error in getAllLeads:", error.stack);
    throw new Error(error.message);
  }
}
