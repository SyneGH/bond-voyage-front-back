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
import { ApiResponse, Booking } from "../types/types";
import { useState, useEffect } from "react";

export const useMyBookings = (
  params?: { page?: number; limit?: number; status?: string },
  options?: UseQueryOptions<ApiResponse<Booking[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.myBookings(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Booking[]>>(
        "/bookings/my-bookings",
        {
          params,
        }
      );
      return response.data;
    },
    ...options,
  });
};

export const useBookingDetail = (
  id: string,
  options?: UseQueryOptions<ApiResponse<Booking>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Booking>>(
        `/bookings/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateBooking = (
  options?: UseMutationOptions<ApiResponse<Booking>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<Booking>>(
        "/bookings",
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

export const useUpdateBooking = (
  id: string,
  options?: UseMutationOptions<ApiResponse<Booking>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put<ApiResponse<Booking>>(
        `/bookings/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};

export const useSubmitBooking = (
  id: string,
  options?: UseMutationOptions<ApiResponse<Booking>, AxiosError, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch<ApiResponse<Booking>>(
        `/bookings/${id}/submit`,
        { data }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};

export const useCancelBooking = (
  id: string,
  options?: UseMutationOptions<ApiResponse<Booking>, AxiosError, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<ApiResponse<Booking>>(
        `/bookings/${id}/cancel`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};

export const useDeleteBooking = (
  id: string,
  options?: UseMutationOptions<ApiResponse, AxiosError, void>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete<ApiResponse>(`/bookings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};

export const useAdminBookings = (
  params?: any,
  options?: UseQueryOptions<ApiResponse<Booking[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.bookings.adminBookings(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Booking[]>>(
        "/bookings/admin/bookings",
        {
          params,
        }
      );

      return response.data;
    },
    ...options,
  });
};

export const useUpdateBookingStatus = (
  id: string,
  options?: UseMutationOptions<ApiResponse<Booking>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      status: string;
      rejectionReason?: string;
      rejectionResolution?: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<Booking>>(
        `/bookings/${id}/status`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
};

export const useBookingPayments = (
  id: string,
  options?: UseQueryOptions<ApiResponse<any>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.payments.list(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any>>(
        `/bookings/${id}/payments`
      );
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const usePaymentProof = (
  paymentId?: string,
  options?: UseQueryOptions<Blob, AxiosError>
) => {
  return useQuery({
    queryKey: [queryKeys.payments.proof, paymentId],
    queryFn: async () => {
      const response = await apiClient.get<Blob>(
        `/payments/${paymentId}/proof`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    },
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

export const usePaymentProofImage = (paymentId?: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { data: blob, isLoading, error, refetch } = usePaymentProof(paymentId);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setImageUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImageUrl(null);
    }
  }, [blob]);

  return {
    data: imageUrl,
    isLoading,
    error,
    refetch,
  };
};
