
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { getFavorites } from "@/services/favoriteService";
import RestaurantCard from "@/components/RestaurantCard";
import type { Restaurant } from "@/types/restaurant";

export default function FavoritesPage() {
  const { user, authLoading } = useAuth();

  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load favorite restaurants"
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      void loadFavorites();
    }
  }, [authLoading, loadFavorites]);

  function handleFavoriteRemoved(restaurantId: string) {
    setFavorites((previous) =>
      previous.filter(
        (restaurant) => restaurant._id !== restaurantId
      )
    );
  }

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
        <p className="text-lg font-semibold text-gray-600">
          Loading your favorites...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf7] px-6 text-center">
        <div className="mb-5 text-6xl">♡</div>

        <h1 className="text-3xl font-bold text-gray-900">
          Login to View Your Favorites
        </h1>

        <p className="mt-4 max-w-md text-gray-600">
          Sign in to save and explore your favorite restaurants.
        </p>

        <Link
          href="/login"
          className="mt-6 rounded-xl bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Login
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-50 via-[#fff1e8] to-orange-100 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm">
            ♥ Your Wishlist
          </span>

          <h1 className="mt-6 text-4xl font-extrabold text-gray-900 md:text-5xl">
            Favorite{" "}
            <span className="text-orange-600">
              Restaurants
            </span>
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            All your favorite food places in one location.
          </p>
        </div>
      </section>

      {/* Favorites */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl bg-red-50 p-4 text-red-600"
          >
            {error}

            <button
              type="button"
              onClick={() => void loadFavorites()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Saved Restaurants ({favorites.length})
          </h2>

          <Link
            href="/restaurants"
            className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Explore More Restaurants
          </Link>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <div className="mb-4 text-6xl">♡</div>

            <h3 className="text-2xl font-bold text-gray-900">
              No Favorite Restaurants Yet
            </h3>

            <p className="mt-3 text-gray-500">
              Save restaurants you love by clicking the heart icon.
            </p>

            <Link
              href="/restaurants"
              className="mt-6 inline-block rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Discover Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onFavoriteRemoved={handleFavoriteRemoved}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
