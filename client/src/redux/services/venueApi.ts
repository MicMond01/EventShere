import { baseApi } from "../baseApi";

export const venueApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVenues: builder.query({
      query: (params) => ({ url: "/venues", params }),
      providesTags: ["Venue"],
    }),
    getVenueById: builder.query({
      query: (id: string) => `/venues/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Venue", id }],
    }),
    createVenue: builder.mutation({
      query: (body) => ({ url: "/venues", method: "POST", body }),
      invalidatesTags: ["Venue"],
    }),
    updateVenue: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/venues/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Venue", id }],
    }),
    deleteVenue: builder.mutation({
      query: (id: string) => ({ url: `/venues/${id}`, method: "DELETE" }),
      invalidatesTags: ["Venue"],
    }),
    getMyVenues: builder.query({
      query: () => "/venues/owner/my",
      providesTags: ["Venue"],
    }),
    getVenueAvailability: builder.query({
      query: ({ id, ...params }: { id: string }) => ({
        url: `/venues/${id}/availability`,
        params,
      }),
    }),
    createVenueReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/venues/${id}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Venue", id }],
    }),
  }),
});

export const {
  useGetVenuesQuery,
  useGetVenueByIdQuery,
  useCreateVenueMutation,
  useUpdateVenueMutation,
  useDeleteVenueMutation,
  useGetMyVenuesQuery,
  useGetVenueAvailabilityQuery,
  useCreateVenueReviewMutation,
} = venueApi;
