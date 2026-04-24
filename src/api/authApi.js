import axiosInstance from "./axiosInstance";

export async function login(payload) {
  const { data } = await axiosInstance.post("/auth/login", payload, {
    skipAuthHandling: true,
  });
  return data;
}

export async function validateSession() {
  const { data } = await axiosInstance.get("/auth/validate", {
    skipAuthHandling: true,
  });
  return data;
}
