import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse, ActivityLog } from "../types/types";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";

interface ActivityLogsParams {
  page?: number;
  limit?: number;
  actorId?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const useActivityLogs = (
  params?: ActivityLogsParams,
  options?: UseQueryOptions<ApiResponse<ActivityLog[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.activityLogs.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
        "/activity-logs",
        {
          params,
        }
      );
      return response.data;
    },
    ...options,
  });
};
