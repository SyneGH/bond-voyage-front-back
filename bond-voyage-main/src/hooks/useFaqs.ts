import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";
import { ApiResponse, FAQ } from "../types/types";

export const useFaqs = (
  params?: { search?: string; page?: number; limit?: number },
  options?: UseQueryOptions<ApiResponse<FAQ[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.faqs.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<FAQ[]>>("/faqs", {
        params,
      });
      return response.data;
    },
    ...options,
  });
};

export const useCreateFaq = (
  options?: UseMutationOptions<ApiResponse<FAQ>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<FAQ>>("/faqs", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
    ...options,
  });
};

export const useUpdateFaq = (
  options?: UseMutationOptions<
    ApiResponse<FAQ>,
    AxiosError,
    { id: string; data: any }
  >
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.put<ApiResponse<FAQ>>(
        `/faqs/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
    ...options,
  });
};

export const useDeleteFaq = (
  options?: UseMutationOptions<ApiResponse, AxiosError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse>(`/faqs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.faqs.all });
    },
    ...options,
  });
};
