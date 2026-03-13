import { baseApi } from "../baseApi";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/users/me",
      providesTags: ["User"],
    }),
    updateMe: builder.mutation({
      query: (body) => ({ url: "/users/me", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({ url: "/users/me/password", method: "PATCH", body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useUpdateMeMutation,
  useUpdatePasswordMutation,
} = userApi;
