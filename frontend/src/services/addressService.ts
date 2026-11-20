
import type {
  AddressInput,
  SavedAddress,
} from "@/types/address";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || result.data == null) {
    throw new Error(
      result.message || `Request failed: ${response.status}`
    );
  }

  return result.data;
}

async function checkResponse(
  response: Response
): Promise<void> {
  const result: ApiResponse<unknown> =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request failed"
    );
  }
}

export async function getAddresses(): Promise<SavedAddress[]> {
  const response = await fetch(
    `${API_URL}/api/addresses`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseResponse<SavedAddress[]>(response);
}

export async function createAddress(
  data: AddressInput
): Promise<SavedAddress> {
  const response = await fetch(
    `${API_URL}/api/addresses`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return parseResponse<SavedAddress>(response);
}

export async function updateAddress(
  id: string,
  data: AddressInput
): Promise<SavedAddress> {
  const response = await fetch(
    `${API_URL}/api/addresses/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  return parseResponse<SavedAddress>(response);
}

export async function setDefaultAddress(
  id: string
): Promise<SavedAddress> {
  const response = await fetch(
    `${API_URL}/api/addresses/${encodeURIComponent(id)}/default`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );

  return parseResponse<SavedAddress>(response);
}

export async function deleteAddress(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/addresses/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  await checkResponse(response);
}
