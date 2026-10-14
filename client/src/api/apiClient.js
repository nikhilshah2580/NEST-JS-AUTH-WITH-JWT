import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let accessToken = null;
let refreshRequest = null;
let onSessionExpired = () => {};

export function setAccessToken(token) {
  accessToken = token;
}

export function setSessionExpiredHandler(handler) {
  onSessionExpired = typeof handler === "function" ? handler : () => {};
}

function getResponseData(response) {
  return response.data?.data ?? response.data;
}

function isAuthEndpoint(url = "") {
  return ["/auth/signup", "/auth/login", "/auth/refresh", "/auth/logout"].some(
    (endpoint) => url.includes(endpoint),
  );
}

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || !originalRequest || originalRequest._retry) {
      if (status) error.status = status;
      return Promise.reject(error);
    }

    if (isAuthEndpoint(originalRequest.url)) {
      error.status = status;
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = api
          .post("/auth/refresh")
          .then((response) => getResponseData(response))
          .then((tokens) => {
            if (!tokens?.accessToken) {
              throw new Error(
                "The refresh response did not include an access token.",
              );
            }
            setAccessToken(tokens.accessToken);
            return tokens.accessToken;
          })
          .finally(() => {
            refreshRequest = null;
          });
      }

      await refreshRequest;
      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      onSessionExpired();
      if (refreshError.response?.status) {
        refreshError.status = refreshError.response.status;
      }
      return Promise.reject(refreshError);
    }
  },
);

api.interceptors.response.use(undefined, (error) => {
  const body = error.response?.data;
  const message = body?.errors?.length ? body.errors.join(". ") : body?.message;

  if (message) error.message = message;
  else if (!error.response) {
    error.message = error.code === "ECONNABORTED"
      ? "The request timed out. Please try again."
      : "Could not connect to the API. Check your connection and try again.";
  }

  if (error.response?.status) error.status = error.response.status;
  return Promise.reject(error);
});

export default api;

export function unwrapApiResponse(response) {
  return getResponseData(response);
}
