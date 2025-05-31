import { Artist, TattooRates, Admin, Lead, TattooRequest, Booking } from "@prisma/client";

export type SafeArtist = Omit<Artist, "createdAt" | "rates"> & {
  createdAt: string;
  rates: SafeTattooRates | null;
};

export type SafeTattooRates = Omit<TattooRates, "artistId">;

export type SafeAdmin = Omit<Admin, "createdAt" | "subscriptionExpiry"> & {
  createdAt: string;
  subscriptionExpiry: string;
};

export type SafeTattooRequest = Omit<TattooRequest, "createdAt"> & {
  createdAt: string;
};

export type SafeBooking = Omit<Booking, "createdAt"> & {
  createdAt: string;
};

export type SafeLead = Omit<
  Lead,
  "createdAt" | "adminId" | "selectedArtistId" | "tattooRequests" | "Booking"
> & {
  createdAt: string;
  adminId: string;
  selectedArtistId: string | null;
  tattooRequests: SafeTattooRequest[];
  Booking: SafeBooking[];
};
