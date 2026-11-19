
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import RestaurantForm from "@/components/admin/RestaurantForm";

import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
} from "@/services/adminRestaurantService";

import type {
  Restaurant,
  RestaurantInput,
} from "@/types/management";

export default function AdminRestaurantsPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load restaurants"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      router.replace(user ? "/" : "/login");
      return;
    }

    void loadRestaurants();
  }, [authLoading, isAdmin, user, router, loadRestaurants]);

  async function handleSave(data: RestaurantInput) {
    if (editing) {
      await updateRestaurant(editing._id, data);
    } else {
      await createRestaurant(data);
    }

    setShowForm(false);
    setEditing(null);
    await loadRestaurants();
  }

  async function handleDelete(restaurant: Restaurant) {
    const confirmed = window.confirm(
      `Delete "${restaurant.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(restaurant._id);
    setError("");

    try {
      await deleteRestaurant(restaurant._id);
      await loadRestaurants();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (authLoading || !isAdmin) {
    return (
      <main className="p-10 text-center text-gray-600">
        {authLoading ? "Checking authentication..." : "Redirecting..."}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-sm text-orange-600">
              ← Back to Dashboard
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Restaurant Management
            </h1>
            <p className="text-gray-600">
              Add, edit and manage FoodNest restaurants.
            </p>
          </div>

          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
          >
            + Add Restaurant
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {showForm && (
          <RestaurantForm
            key={editing?._id ?? "new"}
            initialData={editing}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        )}

        {loading ? (
          <p className="py-10 text-center text-gray-600">
            Loading restaurants...
          </p>
        ) : restaurants.length === 0 ? (
          <p className="rounded-xl bg-white p-10 text-center text-gray-600">
            No restaurants found. Add your first restaurant.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <article
                key={restaurant._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  className="h-44 w-full object-cover"
                />

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {restaurant.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {restaurant.cuisine}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700">
                    {restaurant.description}
                  </p>

                  <div className="flex justify-between text-sm text-gray-700">
                    <span>⭐ {restaurant.rating}</span>
                    <span>{restaurant.deliveryTime}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => {
                        setEditing(restaurant);
                        setShowForm(true);
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                    >
                      Edit
                    </button>

                    <Link
                      href={`/admin/menu?restaurantId=${restaurant._id}`}
                      className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white hover:bg-orange-600"
                    >
                      Manage Menu
                    </Link>

                    <button
                      onClick={() => void handleDelete(restaurant)}
                      disabled={deletingId !== null}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {deletingId === restaurant._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
