
"use client";

import { useMemo, useState } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantFiltersProps {
  restaurants: Restaurant[];
}

type SortOption =
  | "rating"
  | "delivery"
  | "name-asc"
  | "name-desc";

function getDeliveryMinutes(value: string | number): number {
  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : Infinity;
}

export default function RestaurantFilters({
  restaurants,
}: RestaurantFiltersProps) {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("all");
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>("rating");

  // Generate cuisine options from MongoDB restaurant data.
  const cuisines = useMemo(() => {
    return Array.from(
      new Set(
        restaurants
          .map((restaurant) => restaurant.cuisine?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return restaurants
      .filter((restaurant) => {
        const matchesSearch =
          restaurant.name.toLowerCase().includes(query) ||
          (restaurant.cuisine ?? "")
            .toLowerCase()
            .includes(query);

        const matchesCuisine =
          cuisine === "all" ||
          restaurant.cuisine?.toLowerCase() ===
            cuisine.toLowerCase();

        const matchesRating =
          (restaurant.rating ?? 0) >= minRating;

        return (
          matchesSearch &&
          matchesCuisine &&
          matchesRating
        );
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return (b.rating ?? 0) - (a.rating ?? 0);

          case "delivery":
            return (
              getDeliveryMinutes(a.deliveryTime) -
              getDeliveryMinutes(b.deliveryTime)
            );

          case "name-asc":
            return a.name.localeCompare(b.name);

          case "name-desc":
            return b.name.localeCompare(a.name);

          default:
            return 0;
        }
      });
  }, [restaurants, search, cuisine, minRating, sortBy]);

  const resetFilters = () => {
    setSearch("");
    setCuisine("all");
    setMinRating(0);
    setSortBy("rating");
  };

  return (
    <div className="space-y-8">
      {/* Search and filters */}
      <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Find Your Favorite Restaurant
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Search, filter, and discover the best food
            near you.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <label
            htmlFor="restaurant-search"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Search Restaurants
          </label>

          <input
            id="restaurant-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by restaurant name or cuisine..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Filters */}
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label
              htmlFor="cuisine-filter"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Cuisine
            </label>

            <select
              id="cuisine-filter"
              value={cuisine}
              onChange={(event) =>
                setCuisine(event.target.value)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
            >
              <option value="all">All Cuisines</option>

              {cuisines.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rating-filter"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Minimum Rating
            </label>

            <select
              id="rating-filter"
              value={minRating}
              onChange={(event) =>
                setMinRating(Number(event.target.value))
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
            >
              <option value={0}>All Ratings</option>
              <option value={3}>3.0+ Stars</option>
              <option value={4}>4.0+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="sort-filter"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Sort By
            </label>

            <select
              id="sort-filter"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortOption)
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
            >
              <option value="rating">
                Highest Rated
              </option>
              <option value="delivery">
                Fastest Delivery
              </option>
              <option value="name-asc">
                Name: A to Z
              </option>
              <option value="name-desc">
                Name: Z to A
              </option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <p
            aria-live="polite"
            className="text-sm font-medium text-gray-600"
          >
            Showing{" "}
            <span className="font-bold text-orange-600">
              {filteredRestaurants.length}
            </span>{" "}
            of {restaurants.length} restaurants
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="rounded-xl border border-orange-200 px-5 py-2.5 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Restaurant results */}
      {filteredRestaurants.length > 0 ? (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant._id}
              restaurant={restaurant}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-orange-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mb-4 text-5xl">🍽️</div>

          <h3 className="text-2xl font-bold text-gray-900">
            No Restaurants Found
          </h3>

          <p className="mt-3 text-gray-500">
            Try another search or adjust your filters.
          </p>

          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
