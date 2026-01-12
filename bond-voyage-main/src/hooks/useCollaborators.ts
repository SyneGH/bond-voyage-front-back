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
import { ApiResponse } from "../types/types";

export const useBookingCollaborators = (
  bookingId: string,
  options?: UseQueryOptions<ApiResponse<any[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.collaborators(bookingId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `/bookings/${bookingId}/collaborators`
      );
      return response.data;
    },
    enabled: !!bookingId,
    ...options,
  });
};

export const useAddCollaborator = (
  bookingId: string,
  options?: UseMutationOptions<ApiResponse, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId?: string; email?: string }) => {
      const response = await apiClient.post<ApiResponse>(
        `/bookings/${bookingId}/collaborators`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.collaborators(bookingId),
      });
    },
    ...options,
  });
};

export const useRemoveCollaborator = (
  bookingId: string,
  options?: UseMutationOptions<ApiResponse, AxiosError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (collaboratorId: string) => {
      const response = await apiClient.delete<ApiResponse>(
        `/bookings/${bookingId}/collaborators/${collaboratorId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.collaborators(bookingId),
      });
    },
    ...options,
  });
};
