
export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: AuthUser;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function authRequest(
  endpoint: string,
  body: Record<string, string>
): Promise<AuthUser> {
  const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const result: AuthResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Authentication failed");
  }

  return result.data;
}

export function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  return authRequest("register", { name, email, password });
}

export function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  return authRequest("login", { email, password });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Unable to check login status");
  }

  const result: AuthResponse = await response.json();

  return result.data ?? null;
}

export async function logoutUser(): Promise<void> {
  const response = await fetch(`${API_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}
