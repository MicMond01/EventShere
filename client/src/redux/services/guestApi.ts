import { baseApi } from "../baseApi";

export const guestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventGuests: builder.query({
      query: (eventId: string) => `/guests/${eventId}`,
      providesTags: (_result, _error, eventId) => [
        { type: "Guest", id: eventId },
      ],
    }),
    addGuest: builder.mutation({
      query: ({ eventId, ...body }) => ({
        url: `/guests/${eventId}`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Guest", id: eventId },
      ],
    }),
    updateGuest: builder.mutation({
      query: ({ eventId, guestId, ...body }) => ({
        url: `/guests/${eventId}/${guestId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Guest", id: eventId },
      ],
    }),
    removeGuest: builder.mutation({
      query: ({ eventId, guestId }: { eventId: string; guestId: string }) => ({
        url: `/guests/${eventId}/${guestId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Guest", id: eventId },
      ],
    }),
    importGuests: builder.mutation({
      query: ({ eventId, body }: { eventId: string; body: FormData }) => ({
        url: `/guests/${eventId}/import`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Guest", id: eventId },
      ],
    }),
    checkInGuest: builder.mutation({
      query: ({ eventId, guestId }: { eventId: string; guestId: string }) => ({
        url: `/guests/${eventId}/check-in/${guestId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { eventId }) => [
        { type: "Guest", id: eventId },
      ],
    }),
  }),
});

export const {
  useGetEventGuestsQuery,
  useAddGuestMutation,
  useUpdateGuestMutation,
  useRemoveGuestMutation,
  useImportGuestsMutation,
  useCheckInGuestMutation,
} = guestApi;
