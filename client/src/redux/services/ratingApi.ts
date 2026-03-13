import { baseApi } from "../baseApi";

export const ratingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitRating: builder.mutation({
      query: (body) => ({ url: "/ratings", method: "POST", body }),
      invalidatesTags: ["Rating"],
    }),
    getEventRatings: builder.query({
      query: (eventId: string) => `/ratings/event/${eventId}`,
      providesTags: ["Rating"],
    }),
    getMyScore: builder.query({
      query: () => "/ratings/my-score",
      providesTags: ["Rating"],
    }),
  }),
});

export const {
  useSubmitRatingMutation,
  useGetEventRatingsQuery,
  useGetMyScoreQuery,
} = ratingApi;
