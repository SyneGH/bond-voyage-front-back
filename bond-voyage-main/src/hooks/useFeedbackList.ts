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
import { ApiResponse, Feedback } from "../types/types";

export const useFeedbackList = (
  params?: any,
  options?: UseQueryOptions<ApiResponse<Feedback[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.feedback.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Feedback[]>>(
        "/feedback",
        { params }
      );
      return response.data;
    },
    ...options,
  });
};

export const useSubmitFeedback = (
  options?: UseMutationOptions<ApiResponse<Feedback>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const response = await apiClient.post<ApiResponse<Feedback>>(
        "/feedback",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
    ...options,
  });
};

export const useRespondToFeedback = (
  feedbackId: string,
  options?: UseMutationOptions<ApiResponse<Feedback>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { response: string }) => {
      const response = await apiClient.patch<ApiResponse<Feedback>>(
        `/feedback/${feedbackId}/respond`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
    ...options,
  });
};
