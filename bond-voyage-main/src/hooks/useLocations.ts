import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiResponse, Place } from "../types/types";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";

export interface PlacesSearchParams {
  text?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  [key: string]: any;
}

export const usePlacesSearch = (
  params?: PlacesSearchParams,
  options?: UseQueryOptions<ApiResponse<Place[]>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.places.search(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Place[]>>(
        "/places/search",
        { params: { ...params, allowExternal: true } }
      );
      return response.data;
    },
    ...options,
  });
};
