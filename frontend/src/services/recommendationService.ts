
import type { Restaurant } from "@/types/restaurant";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function getRestaurantRecommendations(
  restaurantId: string
): Promise<Restaurant[]> {
  const response = await fetch(
    `${API_URL}/api/restaurants/${encodeURIComponent(
      restaurantId
    )}/recommendations`,
    {
      credentials: "include",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch recommendations");
  }

  const result = await response.json();

  return result.data ?? [];
}
