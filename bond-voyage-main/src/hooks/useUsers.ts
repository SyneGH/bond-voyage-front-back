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
import { ApiResponse, User } from "../types/types";

export const useUsers = (
  params?: any,
  options?: UseQueryOptions<ApiResponse<{ users: User[] }>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ users: User[] }>>(
        "/users",
        {
          params,
        }
      );
      return response.data;
    },
    ...options,
  });
};

export const useUserDetail = (
  id: string,
  options?: UseQueryOptions<ApiResponse<{ user: User }>, AxiosError>
) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ user: User }>>(
        `/users/${id}`
      );
      return response.data;
    },
    enabled: !!id,
    ...options,
  });
};

export const useCreateUser = (
  options?: UseMutationOptions<ApiResponse<{ user: User }>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ApiResponse<{ user: User }>>(
        "/users",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};

export const useUpdateUser = (
  options?: UseMutationOptions<ApiResponse<{ user: User }>, AxiosError, any>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch<ApiResponse<{ user: User }>>(
        `/users/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(data.data?.user.id!),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};

export const useDeactivateUser = (
  options?: UseMutationOptions<ApiResponse, AxiosError, { id: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await apiClient.patch<ApiResponse>(
        `/users/${id}/deactivate`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};
export const useDeleteUser = (
  options?: UseMutationOptions<ApiResponse, AxiosError, { id: string }>
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await apiClient.delete<ApiResponse>(`/users/${id}`);
      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    ...options,
  });
};
