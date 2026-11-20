
"use client";

import { useEffect, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { getRestaurantRecommendations } from "@/services/recommendationService";
import type { Restaurant } from "@/types/restaurant";

interface RecommendedRestaurantsProps {
  restaurantId: string;
}

export default function RecommendedRestaurants({
  restaurantId,
}: RecommendedRestaurantsProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      setLoading(true);
      setError("");

      try {
        const data = await getRestaurantRecommendations(
          restaurantId
        );

        if (!cancelled) {
          setRestaurants(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load recommendations"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  return (
    <section id="recommendations" className="mt-14">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          ✨ Recommended For You
        </h2>

        <p className="mt-2 text-gray-600">
          Discover restaurants based on your preferences
          and customer ratings.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">
          Loading recommendations...
        </p>
      ) : error ? (
        <p role="alert" className="text-red-500">
          {error}
        </p>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500">
          No recommendations available yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
            />
          ))}
        </div>
      )}
    </section>
  );
}
