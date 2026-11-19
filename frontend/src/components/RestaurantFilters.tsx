
"use client";

import { useMemo, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import type { Restaurant } from "@/types/restaurant";

interface Props {
  restaurants: Restaurant[];
}

type SortOption = "default" | "rating" | "delivery" | "name";

export default function RestaurantFilters({
  restaurants,
}: Props) {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [sortBy, setSortBy] = useState<SortOption>("default");

  const cuisines = useMemo(() => {
    const values = restaurants.flatMap((restaurant) =>
      restaurant.cuisine
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    );

    return ["All", ...new Set(values)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = restaurants.filter((restaurant) => {
      const matchesSearch =
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.cuisine.toLowerCase().includes(query);

      const matchesCuisine =
        cuisine === "All" ||
        restaurant.cuisine
          .split(",")
          .some(
            (value) =>
              value.trim().toLowerCase() === cuisine.toLowerCase()
          );

      return matchesSearch && matchesCuisine;
    });

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sortBy === "delivery") {
      const minutes = (value: string) => {
        const match = value.match(/\d+/);
        return match ? Number(match[0]) : Infinity;
      };

      result.sort(
        (a, b) =>
          minutes(a.deliveryTime) - minutes(b.deliveryTime)
      );
    }

    return result;
  }, [restaurants, search, cuisine, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCuisine("All");
    setSortBy("default");
  };

  const hasFilters =
    search !== "" || cuisine !== "All" || sortBy !== "default";

  return (
    <div>
      {/* Search and sorting */}
      <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-orange-500">
              ⌕
            </span>

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search restaurants or cuisines..."
              aria-label="Search restaurants"
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-4 pl-12 pr-5 text-gray-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value as SortOption)
            }
            aria-label="Sort restaurants"
            className="cursor-pointer rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-gray-800 outline-none focus:border-orange-500"
          >
            <option value="default">Default Sorting</option>
            <option value="rating">⭐ Highest Rated</option>
            <option value="delivery">⚡ Fastest Delivery</option>
            <option value="name">A–Z Restaurant Name</option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
            disabled={!hasFilters}
            className="rounded-2xl bg-orange-500 px-6 py-4 font-semibold text-white transition hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Cuisine chips */}
      <div className="mt-8 flex flex-wrap gap-3">
        {cuisines.map((item) => {
          const active = cuisine === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setCuisine(item)}
              aria-pressed={active}
              className={`rounded-full border px-6 py-3 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                active
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-100"
                  : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              {item === "All" ? "🍽️ All Restaurants" : item}
            </button>
          );
        })}
      </div>

      {/* Results header */}
      <div className="mb-6 mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Restaurants for you
          </h2>
          <p className="mt-1 text-sm text-gray-500" aria-live="polite">
            Showing {filteredRestaurants.length} of{" "}
            {restaurants.length} restaurants
          </p>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm font-semibold text-orange-600 hover:underline"
          >
            Clear all filters ×
          </button>
        )}
      </div>

      {/* Restaurant cards */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
          <div className="mb-4 text-6xl">🍽️</div>

          <h3 className="text-2xl font-bold text-gray-900">
            No restaurants found
          </h3>

          <p className="mx-auto mt-3 max-w-md text-gray-500">
            We couldn't find restaurants matching your search.
            Try a different cuisine or search term.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-full bg-orange-500 px-7 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Show All Restaurants
          </button>
        </div>
      )}
    </div>
  );
}
