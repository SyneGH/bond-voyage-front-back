import {
  UseQueryOptions,
  useQuery,
  UseMutationOptions,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";
import { ApiResponse, Inquiry } from "../types/types";

export const useInquiries = (
  params?: any,
  options?: UseQueryOptions<ApiResponse<Inquiry[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.inquiries.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Inquiry[]>>(
        "/inquiries",
        { params }
      );
      return response.data;
    },
    ...options,
  });
};

export const useCreateInquiry = (
  options?: UseMutationOptions<ApiResponse<Inquiry>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<Inquiry>>(
        "/inquiries",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.all });
    },
    ...options,
  });
};

export const useAddInquiryMessage = (
  inquiryId: string,
  options?: UseMutationOptions<ApiResponse, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await apiClient.post<ApiResponse>(
        `/inquiries/${inquiryId}/messages`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inquiries.all });
    },
    ...options,
  });
};
