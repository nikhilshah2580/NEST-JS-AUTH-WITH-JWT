import api, { unwrapApiResponse } from "./apiClient";

export async function signup(details) {
  const response = await api.post("/auth/signup", details);
  return unwrapApiResponse(response);
}

export async function signin(credentials) {
  const response = await api.post("/auth/login", credentials);
  return unwrapApiResponse(response);
}

export async function getProfile() {
  const response = await api.get("/auth/profile");
  return unwrapApiResponse(response);
}

export async function refreshSession() {
  const response = await api.post("/auth/refresh");
  return unwrapApiResponse(response);
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return unwrapApiResponse(response);
}
