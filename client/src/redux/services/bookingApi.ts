import { baseApi } from "../baseApi";

export const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => "/bookings",
      providesTags: ["Booking"],
    }),
    getBookingById: builder.query({
      query: (id: string) => `/bookings/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Booking", id }],
    }),
    createBooking: builder.mutation({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      invalidatesTags: ["Booking"],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/bookings/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Booking", id }],
    }),
    getVenueBookings: builder.query({
      query: (venueId: string) => `/bookings/venue/${venueId}`,
      providesTags: ["Booking"],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useGetVenueBookingsQuery,
} = bookingApi;
