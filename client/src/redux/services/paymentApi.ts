import { baseApi } from "../baseApi";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    initiatePayment: builder.mutation({
      query: (body) => ({ url: "/payments/initiate", method: "POST", body }),
      invalidatesTags: ["Payment"],
    }),
    verifyPayment: builder.query({
      query: (reference: string) => `/payments/verify/${reference}`,
      providesTags: ["Payment"],
    }),
    getBookingPayments: builder.query({
      query: (bookingId: string) => `/payments/booking/${bookingId}`,
      providesTags: ["Payment"],
    }),
  }),
});

export const {
  useInitiatePaymentMutation,
  useVerifyPaymentQuery,
  useGetBookingPaymentsQuery,
} = paymentApi;
