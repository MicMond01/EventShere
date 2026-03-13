import { baseApi } from "../baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      query: (body: FormData) => ({
        url: "/uploads/image",
        method: "POST",
        body,
      }),
    }),
    uploadDocument: builder.mutation({
      query: (body: FormData) => ({
        url: "/uploads/document",
        method: "POST",
        body,
      }),
    }),
    uploadModel: builder.mutation({
      query: (body: FormData) => ({
        url: "/uploads/model",
        method: "POST",
        body,
      }),
    }),
    deleteUpload: builder.mutation({
      query: (publicId: string) => ({
        url: `/uploads/${publicId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadDocumentMutation,
  useUploadModelMutation,
  useDeleteUploadMutation,
} = uploadApi;
