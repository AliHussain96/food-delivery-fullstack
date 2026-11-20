
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export interface CustomerProfile {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message || "Request failed"
    );
  }

  return result.data;
}

export async function getProfile(): Promise<CustomerProfile> {
  const response = await fetch(`${API_URL}/api/profile`, {
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<CustomerProfile>(response);
}

export async function updateProfile(
  name: string
): Promise<CustomerProfile> {
  const response = await fetch(`${API_URL}/api/profile`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  return parseResponse<CustomerProfile>(response);
}
