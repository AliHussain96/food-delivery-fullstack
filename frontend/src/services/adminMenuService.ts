
import type {
  MenuItem,
  MenuItemInput,
} from "@/types/management";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

type ApiResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

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
    throw new Error(result.message || "Request failed");
  }

  if (result.data === undefined) {
    throw new Error("API response is missing data");
  }

  return result.data;
}

// GET /api/menu
export function getMenuItems(): Promise<MenuItem[]> {
  return request<MenuItem[]>("/api/menu");
}

// POST /api/menu/restaurants/:restaurantId/menu
export function createMenuItem(
  restaurantId: string,
  data: MenuItemInput
): Promise<MenuItem> {
  return request<MenuItem>(
    `/api/menu/restaurants/${encodeURIComponent(restaurantId)}/menu`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

// PATCH /api/menu/menu/:id
export function updateMenuItem(
  id: string,
  data: MenuItemInput
): Promise<MenuItem> {
  return request<MenuItem>(
    `/api/menu/menu/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
}

// DELETE /api/menu/menu/:id
export async function deleteMenuItem(
  id: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/menu/menu/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message || "Failed to delete menu item"
    );
  }
}
