import { baseApi } from "../baseApi";

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchVenues: builder.query({
      query: (params) => ({ url: "/search/venues", params }),
    }),
    searchEvents: builder.query({
      query: (params) => ({ url: "/search/events", params }),
    }),
  }),
});

export const { useSearchVenuesQuery, useSearchEventsQuery } = searchApi;
