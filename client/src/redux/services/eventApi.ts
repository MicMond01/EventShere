import { baseApi } from "../baseApi";

export const eventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyEvents: builder.query({
      query: () => "/events/my",
      providesTags: ["Event"],
    }),
    getPublicEvents: builder.query({
      query: (params) => ({ url: "/events/public", params }),
      providesTags: ["Event"],
    }),
    getEventById: builder.query({
      query: (id: string) => `/events/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),
    getEventBySlug: builder.query({
      query: (slug: string) => `/events/slug/${slug}`,
      providesTags: ["Event"],
    }),
    createEvent: builder.mutation({
      query: (body) => ({ url: "/events", method: "POST", body }),
      invalidatesTags: ["Event"],
    }),
    updateEvent: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/events/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Event", id }],
    }),
    deleteEvent: builder.mutation({
      query: (id: string) => ({ url: `/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Event"],
    }),
    publishEvent: builder.mutation({
      query: (id: string) => ({
        url: `/events/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Event", id }],
    }),
  }),
});

export const {
  useGetMyEventsQuery,
  useGetPublicEventsQuery,
  useGetEventByIdQuery,
  useGetEventBySlugQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  usePublishEventMutation,
} = eventApi;
