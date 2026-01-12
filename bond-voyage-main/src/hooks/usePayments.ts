import {
  UseMutationOptions,
  useQueryClient,
  useMutation,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";
import { ApiResponse, Payment } from "../types/types";

export const useSubmitPayment = (
  bookingId: string,
  options?: UseMutationOptions<ApiResponse<Payment>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<Payment>>(
        `/bookings/${bookingId}/payments`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(bookingId),
      });
    },
    ...options,
  });
};

export const useUpdatePaymentStatus = (
  paymentId: string,
  options?: UseMutationOptions<ApiResponse<Payment>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      status: "VERIFIED" | "REJECTED";
      rejectionReason?: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<Payment>>(
        `/payments/${paymentId}/status`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};
