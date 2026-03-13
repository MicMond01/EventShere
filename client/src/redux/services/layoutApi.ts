import { baseApi } from "../baseApi";

export const layoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventLayouts: builder.query({
      query: (eventId: string) => `/layouts/event/${eventId}`,
      providesTags: (_result, _error, eventId) => [
        { type: "Layout", id: eventId },
      ],
    }),
    createLayout: builder.mutation({
      query: (body) => ({ url: "/layouts", method: "POST", body }),
      invalidatesTags: ["Layout"],
    }),
    updateLayout: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/layouts/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Layout"],
    }),
    getLayoutVersions: builder.query({
      query: (id: string) => `/layouts/${id}/versions`,
    }),
    duplicateLayout: builder.mutation({
      query: (id: string) => ({
        url: `/layouts/${id}/duplicate`,
        method: "POST",
      }),
      invalidatesTags: ["Layout"],
    }),
  }),
});

export const {
  useGetEventLayoutsQuery,
  useCreateLayoutMutation,
  useUpdateLayoutMutation,
  useGetLayoutVersionsQuery,
  useDuplicateLayoutMutation,
} = layoutApi;
