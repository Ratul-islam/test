/* eslint-disable @typescript-eslint/no-explicit-any */
import { FETCH, ROUTES } from "./fetch";

export const fetchInquiries = async ({
  searchParams
}: {
  searchParams?: Record<string, string | number>;
}) => {
  try {
    const response: any = await FETCH.get({
      url: ROUTES.INQUIRIES,
      searchParams
    });

    return [response, null];
  } catch (error) {
    return [null, error];
  }
};
