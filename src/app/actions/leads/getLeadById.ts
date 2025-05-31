import prisma from "@/app/utils/prismadb";
import { SafeLead } from "@/app/types";

export default async function getLeadById(leadId: string): Promise<SafeLead | null> {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        tattooRequests: true,
        Booking: true,
      },
    });

    if (!lead) {
      return null;
    }

    return {
      ...lead,
      createdAt: lead.createdAt.toISOString(),
      adminId: lead.adminId,
      selectedArtistId: lead.selectedArtistId || null,
      tattooRequests: lead.tattooRequests.map((request) => ({
        ...request,
        createdAt: request.createdAt.toISOString(),
      })),
      Booking: lead.Booking.map((booking) => ({
        ...booking,
        createdAt: booking.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error in getLeadById:", error);
    return null;
  }
}
