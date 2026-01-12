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
import { ApiResponse, TourPackage } from "../types/types";

export const useTourPackages = (
  params?: { page?: number; limit?: number; q?: string; isActive?: boolean },
  options?: UseQueryOptions<ApiResponse<TourPackage[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.tourPackages.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TourPackage[]>>(
        "/tour-packages",
        {
          params,
        }
      );
      return response.data;
    },
    ...options,
  });
};

export const useTourPackageDetail = (
  id: string,
  options?: UseQueryOptions<ApiResponse<TourPackage>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.tourPackages.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TourPackage>>(
        `/tour-packages/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateTourPackage = (
  options?: UseMutationOptions<ApiResponse<TourPackage>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<TourPackage>>(
        "/tour-packages",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tourPackages.all });
    },
    ...options,
  });
};

export const useUpdateTourPackage = (
  id: string,
  options?: UseMutationOptions<ApiResponse<TourPackage>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.put<ApiResponse<TourPackage>>(
        `/tour-packages/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tourPackages.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.tourPackages.all });
    },
    ...options,
  });
};

export const useDeleteTourPackage = (
  options?: UseMutationOptions<ApiResponse, AxiosError, { id: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await apiClient.delete<ApiResponse>(
        `/tour-packages/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tourPackages.all });
    },
    ...options,
  });
};
