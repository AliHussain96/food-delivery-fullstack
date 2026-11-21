
"use client";

import { useMemo } from "react";

import RestaurantFilters from "@/components/RestaurantFilters";
import RestaurantLocationFilter from "@/components/RestaurantLocationFilter";
import { useLocation } from "@/context/LocationContext";

import type { Restaurant } from "@/types/restaurant";

interface Props {
  restaurants: Restaurant[];
}

export default function LocationAwareRestaurants({
  restaurants,
}: Props) {
  const {
    location,
    setLocation,
    clearLocation,
    locationLoaded,
  } = useLocation();

  const city = location?.city ?? "";
  const area = location?.area ?? "";

  const filteredRestaurants = useMemo(() => {
    if (!city) return restaurants;

    return restaurants.filter((restaurant) => {
      const matchesCity =
        restaurant.city?.trim().toLowerCase() ===
        city.trim().toLowerCase();

      const matchesArea =
        !area ||
        restaurant.deliveryAreas?.some(
          (deliveryArea) =>
            deliveryArea.trim().toLowerCase() ===
            area.trim().toLowerCase()
        );

      return matchesCity && matchesArea;
    });
  }, [restaurants, city, area]);

  function handleCityChange(newCity: string) {
    const normalizedCity = newCity.trim();

    if (!normalizedCity) {
      clearLocation();
      return;
    }

    const areas = Array.from(
      new Set(
        restaurants
          .filter(
            (restaurant) =>
              restaurant.city?.trim().toLowerCase() ===
              normalizedCity.toLowerCase()
          )
          .flatMap(
            (restaurant) => restaurant.deliveryAreas ?? []
          )
          .map((value) => value.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));

    // LocationContext currently requires both fields.
    if (areas.length === 0) {
      clearLocation();
      return;
    }

    setLocation({
      city: normalizedCity,
      area: areas[0],
    });
  }

  function handleAreaChange(newArea: string) {
    const normalizedArea = newArea.trim();

    if (!city || !normalizedArea) return;

    setLocation({
      city,
      area: normalizedArea,
    });
  }

  if (!locationLoaded) {
    return (
      <div className="rounded-2xl border border-orange-100 bg-white p-6 text-sm text-gray-600">
        Loading your delivery location...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <RestaurantLocationFilter
        restaurants={restaurants}
        city={city}
        area={area}
        onCityChange={handleCityChange}
        onAreaChange={handleAreaChange}
      />

      {location && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-orange-600">
              Delivering to
            </p>

            <p className="text-sm font-bold text-gray-900">
              📍 {area}, {city}
            </p>
          </div>

          <button
            type="button"
            onClick={clearLocation}
            className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-600 transition hover:bg-orange-100"
          >
            Clear location
          </button>
        </div>
      )}

      {filteredRestaurants.length === 0 ? (
        <div className="rounded-2xl border border-orange-100 bg-white px-6 py-12 text-center shadow-sm">
          <div className="mb-3 text-4xl">🍽️</div>

          <h2 className="text-xl font-bold text-gray-900">
            No restaurants available
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            {location
              ? `No restaurants currently deliver to ${area}, ${city}. Try selecting another location.`
              : "No restaurants are currently available."}
          </p>
        </div>
      ) : (
        <RestaurantFilters
          restaurants={filteredRestaurants}
        />
      )}
    </div>
  );
}
