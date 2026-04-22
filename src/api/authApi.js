import axiosInstance from "./axiosInstance";

export async function login(payload) {
  const { data } = await axiosInstance.post("/auth/login", payload);
  return data;
}
