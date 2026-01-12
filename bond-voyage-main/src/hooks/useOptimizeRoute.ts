import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  RouteCalculationRequest,
  RouteCalculationResponse,
  RouteOptimizationRequest,
} from "../types/types";
import { apiClient } from "../utils/axios/userAxios";

export const useOptimizeRoute = (
  options?: UseMutationOptions<any, AxiosError, RouteOptimizationRequest>
) => {
  return useMutation({
    mutationFn: async (data: RouteOptimizationRequest) => {
      const response = await apiClient.post("/routes/optimize", data);
      return response.data;
    },
    ...options,
  });
};

export const useCalculateRoute = (
  options?: UseMutationOptions<
    RouteCalculationResponse,
    AxiosError,
    RouteCalculationRequest
  >
) => {
  return useMutation({
    mutationFn: async (data: RouteCalculationRequest) => {
      const response = await apiClient.post("/routes/calculate", data);
      return response.data;
    },
    ...options,
  });
};
