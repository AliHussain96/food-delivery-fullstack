
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import MenuItemForm from "@/components/admin/MenuItemForm";

import { getRestaurants } from "@/services/adminRestaurantService";

import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "@/services/adminMenuService";

import type {
  Restaurant,
  MenuItem,
  MenuItemInput,
} from "@/types/management";

function AdminMenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, authLoading } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [restaurantData, menuData] = await Promise.all([
        getRestaurants(),
        getMenuItems(),
      ]);

      setRestaurants(restaurantData);
      setItems(menuData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load menu data"
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

    void loadData();
  }, [authLoading, isAdmin, user, router, loadData]);

  useEffect(() => {
    const restaurantId = searchParams.get("restaurantId");

    if (restaurantId) {
      setSelectedRestaurant(restaurantId);
    }
  }, [searchParams]);

  const filteredItems = items.filter(
    (item) => item.restaurantId === selectedRestaurant
  );

  async function handleSave(data: MenuItemInput) {
    if (editing) {
      await updateMenuItem(editing._id, data);
    } else {
      if (!selectedRestaurant) {
        throw new Error("Please select a restaurant first");
      }

      await createMenuItem(selectedRestaurant, data);
    }

    setEditing(null);
    setShowForm(false);
    await loadData();
  }

  async function handleDelete(item: MenuItem) {
    if (!window.confirm(`Delete "${item.name}"?`)) return;

    setBusyId(item._id);
    setError("");

    try {
      await deleteMenuItem(item._id);
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete item"
      );
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAvailability(item: MenuItem) {
    setBusyId(item._id);
    setError("");

    try {
      await updateMenuItem(item._id, {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.category,
        isAvailable: !item.isAvailable,
      });

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update availability"
      );
    } finally {
      setBusyId(null);
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
              Menu Management
            </h1>
            <p className="text-gray-600">
              Manage food items for each restaurant.
            </p>
          </div>

          <button
            disabled={!selectedRestaurant}
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            + Add Food Item
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <div className="rounded-xl border bg-white p-5">
          <label
            htmlFor="restaurant"
            className="mb-2 block font-medium text-gray-800"
          >
            Select Restaurant
          </label>

          <select
            id="restaurant"
            value={selectedRestaurant}
            onChange={(event) => {
              setSelectedRestaurant(event.target.value);
              setEditing(null);
              setShowForm(false);
            }}
            className="w-full rounded-lg border p-3 text-gray-900 md:max-w-md"
          >
            <option value="">Choose a restaurant</option>

            {restaurants.map((restaurant) => (
              <option
                key={restaurant._id}
                value={restaurant._id}
              >
                {restaurant.name}
              </option>
            ))}
          </select>
        </div>

        {showForm && selectedRestaurant && (
          <MenuItemForm
            key={editing?._id ?? `new-${selectedRestaurant}`}
            initialData={editing}
            onSave={handleSave}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        )}

        {loading ? (
          <p className="py-10 text-center text-gray-600">
            Loading menu...
          </p>
        ) : !selectedRestaurant ? (
          <p className="rounded-xl bg-white p-10 text-center text-gray-600">
            Select a restaurant to view its menu.
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="rounded-xl bg-white p-10 text-center text-gray-600">
            No food items found for this restaurant.
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item._id}
                className="overflow-hidden rounded-xl border bg-white shadow-sm"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-44 w-full object-cover"
                />

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {item.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {item.category}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600">
                    {item.description}
                  </p>

                  <p className="text-xl font-bold text-orange-600">
                    ₹{item.price.toFixed(2)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setEditing(item);
                        setShowForm(true);
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white"
                    >
                      Edit
                    </button>

                    <button
                      disabled={busyId !== null}
                      onClick={() => void toggleAvailability(item)}
                      className="rounded-lg bg-gray-700 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {item.isAvailable ? "Disable" : "Enable"}
                    </button>

                    <button
                      disabled={busyId !== null}
                      onClick={() => void handleDelete(item)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                      {busyId === item._id ? "Saving..." : "Delete"}
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

export default function AdminMenuPage() {
  return (
    <Suspense fallback={<p>Loading menu...</p>}>
      <AdminMenuContent />
    </Suspense>
  );
}
