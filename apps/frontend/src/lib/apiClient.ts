import type { ApiResponse } from "@x-chicken/shared";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/+$/, "");

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiClientError(
      "NETWORK_ERROR",
      `Unable to reach the X-Chicken API server (${API_BASE_URL}). Please verify your connection and try again.`,
      0
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      "INVALID_RESPONSE",
      "Unexpected response from server",
      response.status
    );
  }

  if (!response.ok || !payload || !payload.ok) {
    const err = payload && !payload.ok ? payload.error : null;
    throw new ApiClientError(
      err?.code || "REQUEST_FAILED",
      err?.message || "Request failed",
      response.status,
      err?.details
    );
  }

  return payload.data;
}
