import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/utils/prismadb";
import getCurrentAdmin from "@/app/actions/admin/getCurrentAdmin";
import getAllLeads from "@/app/actions/leads/getAllLeads";
import getLeadById from "@/app/actions/leads/getLeadById";
import {
  startOfYear,
  endOfYear,
  startOfMonth,
  endOfMonth,
  subYears,
  subMonths
} from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const currentAdmin = await getCurrentAdmin();

    if (!currentAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get("leadId");

    if (leadId) {
      const lead = await getLeadById(leadId);

      if (!lead) {
        return NextResponse.json(
          { message: "Lead not found." },
          { status: 404 }
        );
      }

      return NextResponse.json(lead, { status: 200 });
    }

    if (searchParams.get("graph")) {
      const now = new Date();
      const thisYearStart = startOfYear(now);
      const thisYearEnd = endOfYear(now);
      const lastYearStart = startOfYear(subYears(now, 1));
      const lastYearEnd = endOfYear(subYears(now, 1));

      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Fetch counts using Prisma
      const [thisYearLeads, lastYearLeads, thisMonthLeads, lastMonthLeads] =
        await Promise.all([
          prisma.lead.count({
            where: {
              adminId: currentAdmin.id,
              createdAt: { gte: thisYearStart, lte: thisYearEnd }
            }
          }),
          prisma.lead.count({
            where: {
              adminId: currentAdmin.id,
              createdAt: { gte: lastYearStart, lte: lastYearEnd }
            }
          }),
          prisma.lead.count({
            where: {
              adminId: currentAdmin.id,
              createdAt: { gte: thisMonthStart, lte: thisMonthEnd }
            }
          }),
          prisma.lead.count({
            where: {
              adminId: currentAdmin.id,
              createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
            }
          })
        ]);

      // Calculate percentage changes
      const percentageChangeYear =
        lastYearLeads > 0
          ? ((thisYearLeads - lastYearLeads) / lastYearLeads) * 100
          : 100;
      const percentageChangeMonth =
        lastMonthLeads > 0
          ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100
          : 100;

      return NextResponse.json(
        {
          thisYearLeads,
          lastYearLeads,
          percentageChangeYear,
          thisMonthLeads,
          lastMonthLeads,
          percentageChangeMonth
        },
        { status: 200 }
      );
    }

    const leads = await getAllLeads({
      adminId: currentAdmin.id,
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      searchString: searchParams.get("searchString") || "",
      orderBy: searchParams.get("orderBy") || "asc"
    });
    return NextResponse.json(leads, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching leads:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { message: error.message || "Error fetching leads." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Unknown error occurred while fetching leads." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = req.headers.get('referer')?.split('/tattoo-viewer/')[1]?.split('?')[0]?.split('/')[0];



    const body = await req.json();
    const {
      clientName,
      artistName,
      email,
      phone,
      gender,
      skinTone,
      Designs,
      tattooRequests,
      priceEstimate,
      depositPaid,
      confirmed3DModel,
      tattooCloseups,
      bookingDate
    } = body;

    if (
        !clientName || !artistName || !email || !gender || !skinTone ||
        !Array.isArray(Designs) || !Array.isArray(tattooRequests) ||
        !priceEstimate || !depositPaid || !bookingDate || !Array.isArray(tattooCloseups)
      ) {
        return NextResponse.json(
          { message: "Invalid input parameters." },
          { status: 400 }
        );
      }

    const lead = await prisma.lead.create({
      data: {
        adminId: adminId || "",
        clientName,
        artistName,
        email,
        phone,
        gender,
        skinTone,
        Designs,
        priceEstimate,
        tattooCloseups,
        depositPaid: parseFloat(depositPaid),
        confirmed3DModel,
        tattooRequests: {
          createMany: {
            data: tattooRequests.map(request => ({
              description: request.description,
              imageUrls: request.imageUrls
            }))
          }
        },
        Booking: {
          create: {
            adminId: adminId || "",
            date: new Date(bookingDate)
          }
        }
      },
      include: {
        tattooRequests: true,
        Booking: true
      }
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating lead:", error);

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
}
