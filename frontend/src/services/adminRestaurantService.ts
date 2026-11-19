
import type {
  Restaurant,
  RestaurantInput,
} from "@/types/management";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

// Reusable API request function
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const result: ApiResult<T> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Request failed"
    );
  }

  if (result.data === undefined) {
    throw new Error(
      "API response is missing data"
    );
  }

  return result.data;
}

// ======================================
// GET ALL RESTAURANTS
// GET /api/restaurants
// ======================================

export function getRestaurants(): Promise<Restaurant[]> {
  return request<Restaurant[]>("/api/restaurants");
}

// ======================================
// CREATE RESTAURANT
// POST /api/restaurants
// ======================================

export function createRestaurant(
  data: RestaurantInput
): Promise<Restaurant> {
  return request<Restaurant>(
    "/api/restaurants",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// ======================================
// UPDATE RESTAURANT
// PATCH /api/restaurants/:id
// ======================================

export function updateRestaurant(
  id: string,
  data: RestaurantInput
): Promise<Restaurant> {
  return request<Restaurant>(
    `/api/restaurants/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// ======================================
// DELETE RESTAURANT
// DELETE /api/restaurants/:id
// ======================================

export async function deleteRestaurant(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/restaurants/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const result = await response
      .json()
      .catch(() => null);

    throw new Error(
      result?.message ||
        "Failed to delete restaurant"
    );
  }
}
