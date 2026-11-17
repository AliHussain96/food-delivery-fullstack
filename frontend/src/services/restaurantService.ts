
import type { Restaurant } from "@/types/restaurant";

const API_URL = process.env.API_URL || "http://localhost:5000";

interface RestaurantListResponse {
  success: boolean;
  count: number;
  data: Restaurant[];
}

interface RestaurantDetailsResponse {
  success: boolean;
  data: Restaurant;
}

// Fetch all restaurants
export async function getRestaurants(): Promise<Restaurant[]> {
  const response = await fetch(`${API_URL}/api/restaurants`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch restaurants");
  }

  const result: RestaurantListResponse = await response.json();

  return result.data;
}

// Fetch a restaurant by MongoDB ID
export async function getRestaurantById(
  id: string
): Promise<Restaurant | null> {
  const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 400) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch restaurant");
  }

  const result: RestaurantDetailsResponse = await response.json();

  return result.data;
}
