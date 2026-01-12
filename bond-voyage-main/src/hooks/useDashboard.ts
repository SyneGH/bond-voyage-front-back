import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse, DashboardStats } from "../types/types";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";

interface DashboardParams {
  year?: number;
}

export const useDashboardStats = (
  params?: DashboardParams,
  options?: UseQueryOptions<ApiResponse<DashboardStats>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(params?.year),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<DashboardStats>>(
        "/dashboard/stats",
        {
          params,
        }
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};
