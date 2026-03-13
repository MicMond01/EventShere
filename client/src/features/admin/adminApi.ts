import { api } from "../../app/api/apiSlice";
import type { ApiResponse } from "../../app/api/types";

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getPlatformStats: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/stats" }),
      providesTags: ["Admin"],
    }),
    listUsers: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/users" }),
      providesTags: ["Admin"],
    }),
    updateUserStatus: build.mutation<ApiResponse<unknown>, { id: string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    getPendingVenues: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/venues/pending" }),
      providesTags: ["Admin"],
    }),
    reviewVenue: build.mutation<ApiResponse<unknown>, { id: string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `/admin/venues/${id}/review`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin", "Venue"],
    }),
    getFlaggedRatings: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/ratings/flagged" }),
      providesTags: ["Admin"],
    }),
    deleteRating: build.mutation<ApiResponse<null>, { id: string }>({
      query: ({ id }) => ({ url: `/admin/ratings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admin", "Rating"],
    }),
    getEvents: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/events" }),
      providesTags: ["Admin"],
    }),
    updateEventStatus: build.mutation<ApiResponse<unknown>, { id: string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `/admin/events/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin", "Event"],
    }),
    deleteEvent: build.mutation<ApiResponse<null>, { id: string }>({
      query: ({ id }) => ({ url: `/admin/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admin", "Event"],
    }),
    getBookings: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/bookings" }),
      providesTags: ["Admin"],
    }),
    updateBookingStatus: build.mutation<ApiResponse<unknown>, { id: string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `/admin/bookings/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin", "Booking"],
    }),
    deleteBooking: build.mutation<ApiResponse<null>, { id: string }>({
      query: ({ id }) => ({ url: `/admin/bookings/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admin", "Booking"],
    }),
    getAllGuests: build.query<ApiResponse<unknown>, void>({
      query: () => ({ url: "/admin/guests" }),
      providesTags: ["Admin", "Guest"],
    }),
  }),
});

export const {
  useGetPlatformStatsQuery,
  useListUsersQuery,
  useUpdateUserStatusMutation,
  useGetPendingVenuesQuery,
  useReviewVenueMutation,
  useGetFlaggedRatingsQuery,
  useDeleteRatingMutation,
  useGetEventsQuery,
  useUpdateEventStatusMutation,
  useDeleteEventMutation,
  useGetBookingsQuery,
  useUpdateBookingStatusMutation,
  useDeleteBookingMutation,
  useGetAllGuestsQuery,
} = adminApi;

