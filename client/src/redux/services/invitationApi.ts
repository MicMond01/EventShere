import { baseApi } from "../baseApi";

export const invitationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendInvitations: builder.mutation({
      query: (body) => ({ url: "/invitations/send", method: "POST", body }),
      invalidatesTags: ["Invitation"],
    }),
    getEventInvitations: builder.query({
      query: (eventId: string) => `/invitations/event/${eventId}`,
      providesTags: (_result, _error, eventId) => [
        { type: "Invitation", id: eventId },
      ],
    }),
    respondRsvp: builder.mutation({
      query: ({ token, ...body }) => ({
        url: `/invitations/rsvp/${token}`,
        method: "POST",
        body,
      }),
    }),
    resendInvitations: builder.mutation({
      query: (body) => ({ url: "/invitations/resend", method: "POST", body }),
    }),
  }),
});

export const {
  useSendInvitationsMutation,
  useGetEventInvitationsQuery,
  useRespondRsvpMutation,
  useResendInvitationsMutation,
} = invitationApi;
