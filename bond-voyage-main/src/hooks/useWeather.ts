import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { WeatherResponse } from "../types/types";
import { apiClient } from "../utils/axios/userAxios";
import { queryKeys } from "../utils/lib/queryKeys";

interface WeatherParams {
  lat: number;
  lng: number;
}

export const useWeather = (
  params: WeatherParams,
  options?: UseQueryOptions<WeatherResponse, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.weather.current(params.lat, params.lng),
    queryFn: async () => {
      const response = await apiClient.get<WeatherResponse>("/weather", {
        params: {
          lat: params.lat,
          lng: params.lng,
        },
      });
      return response.data;
    },
    enabled: !!params.lat && !!params.lng,
    staleTime: 1000 * 60 * 30,
    ...options,
  });
};
