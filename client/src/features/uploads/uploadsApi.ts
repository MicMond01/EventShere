import { api } from "../../app/api/apiSlice";
import type { ApiResponse } from "../../app/api/types";

type UploadResult = { url: string; thumbnailUrl?: string };

export const uploadsApi = api.injectEndpoints({
  endpoints: (build) => ({
    uploadImage: build.mutation<ApiResponse<UploadResult>, FormData>({
      query: (body) => ({
        url: "/uploads/image",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Upload"],
    }),
    uploadImages: build.mutation<ApiResponse<UploadResult[]>, FormData>({
      query: (body) => ({
        url: "/uploads/images",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Upload"],
    }),
    uploadVideo: build.mutation<ApiResponse<UploadResult>, FormData>({
      query: (body) => ({ url: "/uploads/video", method: "POST", body }),
      invalidatesTags: ["Upload"],
    }),
    uploadModel: build.mutation<ApiResponse<UploadResult>, FormData>({
      query: (body) => ({ url: "/uploads/model", method: "POST", body }),
      invalidatesTags: ["Upload"],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadImagesMutation,
  useUploadVideoMutation,
  useUploadModelMutation,
} = uploadsApi;

