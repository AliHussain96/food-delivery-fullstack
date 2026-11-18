
import type { MenuItem } from "@/types/menu";

interface MenuResponse {
  success: boolean;
  count?: number;
  data: MenuItem[];
}

const API_URL = process.env.API_URL || "http://localhost:5000";

// Get all menu items for homepage
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const response = await fetch(`${API_URL}/api/menu`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch all menu items");
  }

  const result: MenuResponse = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid menu API response");
  }

  return result.data;
}

// Get menu items for a particular restaurant
export async function getRestaurantMenu(
  restaurantId: string
): Promise<MenuItem[]> {
  const response = await fetch(
    `${API_URL}/api/restaurants/${restaurantId}/menu`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch restaurant menu");
  }

  const result: MenuResponse = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Invalid restaurant menu API response");
  }

  return result.data;
}
