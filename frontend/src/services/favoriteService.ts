
import type { Restaurant } from "@/types/restaurant";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function favoriteRequest<T>(
  endpoint: string,
  method: "GET" | "POST" | "DELETE" = "GET"
): Promise<T> {
  const response = await fetch(
    `${API_URL}/api/favorites${endpoint}`,
    {
      method,
      credentials: "include",
      cache: "no-store",
    }
  );

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Favorite request failed"
    );
  }

  if (result.data === undefined) {
    throw new Error("Invalid favorites response");
  }

  return result.data;
}

export async function getFavorites(): Promise<Restaurant[]> {
  return favoriteRequest<Restaurant[]>("/");
}

export async function checkFavorite(
  restaurantId: string
): Promise<boolean> {
  const result = await favoriteRequest<{
    isFavorite: boolean;
  }>(`/check/${encodeURIComponent(restaurantId)}`);

  return result.isFavorite;
}

export async function addFavorite(
  restaurantId: string
): Promise<void> {
  await favoriteRequestWithoutData(
    `/${encodeURIComponent(restaurantId)}`,
    "POST"
  );
}

export async function removeFavorite(
  restaurantId: string
): Promise<void> {
  await favoriteRequestWithoutData(
    `/${encodeURIComponent(restaurantId)}`,
    "DELETE"
  );
}

async function favoriteRequestWithoutData(
  endpoint: string,
  method: "POST" | "DELETE"
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/favorites${endpoint}`,
    {
      method,
      credentials: "include",
    }
  );

  const result: ApiResponse<unknown> =
    await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Unable to update favorites"
    );
  }
}
