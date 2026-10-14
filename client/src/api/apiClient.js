const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(
  /\/+$/,
  "",
);

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { accessToken, ...options } = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
    });
  } catch {
    throw new ApiError(
      "Could not connect to the API. Check that the backend is running.",
    );
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    if (response.ok) {
      throw new ApiError(
        "The API returned an invalid response.",
        response.status,
      );
    }
  }

  if (!response.ok) {
    const message = body?.errors?.length
      ? body.errors.join(". ")
      : body?.message;
    throw new ApiError(
      message || `Request failed (${response.status}).`,
      response.status,
    );
  }

  return body?.data ?? body;
}

export const apiClient = {
  signup: (details) =>
    request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(details),
    }),

  signin: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  getProfile: (accessToken) => request("/auth/profile", { accessToken }),

  refreshSession: () => request("/auth/refresh", { method: "POST" }),

  logout: () => request("/auth/logout", { method: "POST" }),
};
