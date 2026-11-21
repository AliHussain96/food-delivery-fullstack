
"use client";

import { useMemo } from "react";
import type { Restaurant } from "@/types/restaurant";

interface Props {
  restaurants: Restaurant[];
  city: string;
  area: string;
  onCityChange: (city: string) => void;
  onAreaChange: (area: string) => void;
}

export default function RestaurantLocationFilter({
  restaurants,
  city,
  area,
  onCityChange,
  onAreaChange,
}: Props) {
  const cities = useMemo(() => {
    return Array.from(
      new Set(
        restaurants
          .map((restaurant) => restaurant.city?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  const areas = useMemo(() => {
    if (!city) return [];

    return Array.from(
      new Set(
        restaurants
          .filter(
            (restaurant) =>
              restaurant.city?.trim().toLowerCase() ===
              city.trim().toLowerCase()
          )
          .flatMap(
            (restaurant) => restaurant.deliveryAreas ?? []
          )
          .map((value) => value.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [restaurants, city]);

  return (
    <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-gray-900">
          📍 Delivery Location
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          Select your city and delivery area to find
          restaurants that serve your location.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="restaurant-city"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            City
          </label>

          <select
            id="restaurant-city"
            value={city}
            onChange={(event) =>
              onCityChange(event.target.value)
            }
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          >
            <option value="">All Cities</option>

            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

            {city &&
              !cities.some(
                (item) =>
                  item.toLowerCase() === city.toLowerCase()
              ) && (
                <option value={city}>
                  {city} (saved)
                </option>
              )}
          </select>
        </div>

        <div>
          <label
            htmlFor="restaurant-area"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Delivery Area
          </label>

          <select
            id="restaurant-area"
            value={area}
            disabled={!city || areas.length === 0}
            onChange={(event) =>
              onAreaChange(event.target.value)
            }
            className="w-full rounded-xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">
              {city
                ? "Select Delivery Area"
                : "Select City First"}
            </option>

            {areas.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}

            {area &&
              !areas.some(
                (item) =>
                  item.toLowerCase() === area.toLowerCase()
              ) && (
                <option value={area}>
                  {area} (saved)
                </option>
              )}
          </select>
        </div>
      </div>

      {(city || area) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-orange-700">
            Showing restaurants for{" "}
            {area ? `${area}, ` : ""}
            {city}
          </p>

          <button
            type="button"
            onClick={() => onCityChange("")}
            className="text-sm font-semibold text-orange-600 hover:text-orange-800"
          >
            Clear Location
          </button>
        </div>
      )}
    </div>
  );
}
