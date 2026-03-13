import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
} from "@reduxjs/toolkit/query/react";
import { clearCredentials, setCredentials } from "./slices/authSlice";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wrapper that silently refreshes the access token on a 401 response.
 * If the refresh also fails the user is logged out.
 */
const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt token refresh
    const refreshResult = await rawBaseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        accessToken: string;
        user: unknown;
      };
      api.dispatch(
        setCredentials({
          accessToken: data.accessToken,
          user: data.user,
        })
      );
      // Retry the original request with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Venue",
    "Event",
    "Guest",
    "Booking",
    "Layout",
    "Invitation",
    "Rating",
    "Payment",
    "Seating",
    "Notification",
    "Admin",
  ],
  endpoints: () => ({}),
});
