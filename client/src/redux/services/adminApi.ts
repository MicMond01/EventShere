import { baseApi } from "../baseApi";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminUsers: builder.query({
      query: (params) => ({ url: "/admin/users", params }),
      providesTags: ["Admin"],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin"],
    }),
    getPendingVenues: builder.query({
      query: () => "/admin/venues/pending",
      providesTags: ["Admin", "Venue"],
    }),
    approveVenue: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/admin/venues/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Admin", "Venue"],
    }),
    getAdminStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useGetPendingVenuesQuery,
  useApproveVenueMutation,
  useGetAdminStatsQuery,
} = adminApi;
