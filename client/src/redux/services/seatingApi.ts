import { baseApi } from "../baseApi";

export const seatingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    runSeatingAlgorithm: builder.mutation({
      query: (eventId: string) => ({
        url: `/seating/run/${eventId}`,
        method: "POST",
      }),
      invalidatesTags: ["Seating", "Guest"],
    }),
    getSeatingAssignments: builder.query({
      query: (eventId: string) => `/seating/assignments/${eventId}`,
      providesTags: (_result, _error, eventId) => [
        { type: "Seating", id: eventId },
      ],
    }),
  }),
});

export const {
  useRunSeatingAlgorithmMutation,
  useGetSeatingAssignmentsQuery,
} = seatingApi;
