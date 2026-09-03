import { clearToken, getToken } from "@/lib/auth-storage";
import type {
  AuthResponse,
  ChatMessage,
  CreateScoutPayload,
  MeResponse,
  ReceivedScout,
  ScoutsResponse,
  ScoutStatus,
  SentScout,
  SentScoutsResponse,
  SignupPayload,
  StudentSearchParams,
  StudentsResponse,
} from "@/lib/types";

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

export function signupRequest(payload: SignupPayload) {
  return request<AuthResponse>("/api/v1/signup", {
    method: "POST",
    body: JSON.stringify({ user: payload }),
  });
}

export function getStudents(params: StudentSearchParams = {}) {
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.grade) query.set("grade", params.grade);
  if (params.has_github) query.set("has_github", "true");
  const qs = query.toString();
  return request<StudentsResponse>(`/api/v1/students${qs ? `?${qs}` : ""}`);
}

export function createScout(payload: CreateScoutPayload) {
  return request<{ scout: SentScout }>("/api/v1/scouts", {
    method: "POST",
    body: JSON.stringify({ scout: payload }),
  });
}

export function getScouts() {
  return request<ScoutsResponse>("/api/v1/scouts");
}

export function getSentScouts() {
  return request<SentScoutsResponse>("/api/v1/scouts");
}

export function updateScoutStatus(id: number, status: Extract<ScoutStatus, "accepted" | "declined">) {
  return request<{ scout: ReceivedScout }>(`/api/v1/scouts/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ scout: { status } }),
  });
}

export function getMessages(scoutId: number) {
  return request<{ messages: ChatMessage[] }>(`/api/v1/scouts/${scoutId}/messages`);
}

export function createMessage(scoutId: number, body: string) {
  return request<{ message: ChatMessage }>(`/api/v1/scouts/${scoutId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message: { body } }),
  });
}
