import { authAxios } from "../axios/authAxios";

export const login = async (email: string, password: string) => {
  const response = await authAxios.post("/auth/login", {
    email,
    password,
  });

  return response;
};
