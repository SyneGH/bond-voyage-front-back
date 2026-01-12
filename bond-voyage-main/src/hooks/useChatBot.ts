import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  ApiResponse,
  ChatbotResponse,
  ChatbotRequest,
  RoamanRequest,
  RoamanResponse,
} from "../types/types";
import { apiClient } from "../utils/axios/userAxios";

export const useRoameoChatbot = (
  options?: UseMutationOptions<
    ApiResponse<ChatbotResponse>,
    AxiosError,
    ChatbotRequest
  >
) => {
  return useMutation({
    mutationFn: async (data: ChatbotRequest) => {
      const response = await apiClient.post<ApiResponse<ChatbotResponse>>(
        "/chatbots/roameo",
        data
      );
      return response.data;
    },
    ...options,
  });
};

export const useRoamanChatbot = (
  options?: UseMutationOptions<RoamanResponse, AxiosError, RoamanRequest>
) => {
  return useMutation<RoamanResponse, AxiosError, RoamanRequest>({
    mutationFn: async (data: RoamanRequest) => {
      const response = await apiClient.post<RoamanResponse>(
        "/chatbots/roaman",
        data
      );
      return response.data;
    },
    ...options,
  });
};
