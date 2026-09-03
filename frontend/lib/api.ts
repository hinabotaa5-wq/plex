import { clearToken, getToken } from "@/lib/auth-storage";
import type { AuthResponse, MeResponse } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, errors: string[]) {
    super(errors.join(", "));
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errors = extractErrors(data);
    if (response.status === 401) {
      clearToken();
    }
    throw new ApiError(response.status, errors);
  }

  return data as T;
}

function extractErrors(data: unknown): string[] {
  if (
    typeof data === "object" &&
    data !== null &&
    "errors" in data &&
    Array.isArray((data as { errors: unknown }).errors)
  ) {
    return (data as { errors: string[] }).errors;
  }
  return ["リクエストに失敗しました"];
}

export function loginRequest(email: string, password: string) {
  return request<AuthResponse>("/api/v1/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function meRequest() {
  return request<MeResponse>("/api/v1/me");
}
