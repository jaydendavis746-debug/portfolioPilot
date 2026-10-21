import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.warn("EXPO_PUBLIC_API_URL is not set — check mobile/.env");
}

const TOKEN_KEY = "auth_token";

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

interface RequestOptions extends RequestInit {
  data?: unknown;
}

export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers = {}, ...rest } = options;

  const token = await getToken();

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: reqHeaders,
    body: data ? JSON.stringify(data) : undefined,
  });

  let result: any = null;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  }

  if (!response.ok) {
    const message = result?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return result as T;
}

export const api = {
  get: <T = any>(path: string) => request<T>(path, { method: "GET" }),
  post: <T = any>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", data }),
  patch: <T = any>(path: string, data?: unknown) =>
    request<T>(path, { method: "PATCH", data }),
  delete: <T = any>(path: string) => request<T>(path, { method: "DELETE" }),
};
