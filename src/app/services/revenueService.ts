/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FETCH, ROUTES } from './fetch';
import { Lead, Booking } from '@prisma/client';

interface RevenueData {
  weeklySales: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  weeklySalesChange: number;
  monthlyRevenueChange: number;
}

interface LeadWithBookings extends Lead {
  Booking: Booking[];
}

export const fetchRevenueData = async (): Promise<[RevenueData | null, any]> => {
  try {
    // Fetch all leads with their bookings
    const response:any = await FETCH.get({ 
      url: ROUTES.LEADS,
      searchParams: { include: 'bookings' }
    });


    const leads: LeadWithBookings[] = response.records;

    // Get current date ranges
    const now = new Date();
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentYearStart = new Date(now.getFullYear(), 0, 1);

    // Previous periods for comparison
    const prevWeekStart = new Date(currentWeekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevMonthStart = new Date(currentMonthStart);
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);

    // Calculate revenue metrics
    let weeklySales = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;
    let prevWeekSales = 0;
    let prevMonthRevenue = 0;

    leads.forEach(lead => {
      const leadDate = new Date(lead.createdAt);
      const depositAmount = lead.depositPaid || 0;

      // Current period calculations
      if (leadDate >= currentWeekStart) {
        weeklySales += depositAmount;
      }
      if (leadDate >= currentMonthStart) {
        monthlyRevenue += depositAmount;
      }
      if (leadDate >= currentYearStart) {
        yearlyRevenue += depositAmount;
      }

      // Previous period calculations
      if (leadDate >= prevWeekStart && leadDate < currentWeekStart) {
        prevWeekSales += depositAmount;
      }
      if (leadDate >= prevMonthStart && leadDate < currentMonthStart) {
        prevMonthRevenue += depositAmount;
      }

      // Add revenue from completed bookings
      lead.Booking?.forEach(booking => {
        if (booking.status === 'COMPLETED') {
          const bookingDate = new Date(booking.createdAt);
          const bookingAmount = (lead.priceEstimate || 0) - (lead.depositPaid || 0);

          if (bookingDate >= currentWeekStart) {
            weeklySales += bookingAmount;
          }
          if (bookingDate >= currentMonthStart) {
            monthlyRevenue += bookingAmount;
          }
          if (bookingDate >= currentYearStart) {
            yearlyRevenue += bookingAmount;
          }
          if (bookingDate >= prevWeekStart && bookingDate < currentWeekStart) {
            prevWeekSales += bookingAmount;
          }
          if (bookingDate >= prevMonthStart && bookingDate < currentMonthStart) {
            prevMonthRevenue += bookingAmount;
          }
        }
      });
    });

    // Calculate percentage changes
    const weeklySalesChange = prevWeekSales > 0 
      ? ((weeklySales - prevWeekSales) / prevWeekSales) * 100 
      : weeklySales > 0 ? 100 : 0;

    const monthlyRevenueChange = prevMonthRevenue > 0 
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : monthlyRevenue > 0 ? 100 : 0;

    const revenueData: RevenueData = {
      weeklySales,
      monthlyRevenue,
      yearlyRevenue,
      weeklySalesChange: parseFloat(weeklySalesChange.toFixed(2)),
      monthlyRevenueChange: parseFloat(monthlyRevenueChange.toFixed(2))
    };

    return [revenueData, null];
  } catch (error) {
    return [null, error];
  }
};