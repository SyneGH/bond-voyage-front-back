import axios from "axios";

export const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});
