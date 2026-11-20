
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import OrderCard from "@/components/OrderCard";
import OrderHistoryFilters, {
  type OrderStatusFilter,
  type OrderSort,
} from "@/components/orders/OrderHistoryFilters";

import { getAllOrders } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";

import type { Order } from "@/types/order";

export default function OrdersPage() {
  const router = useRouter();

  // Existing order states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New filter states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<OrderStatusFilter>("all");
  const [sort, setSort] = useState<OrderSort>("newest");

  // Fetch customer orders
  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        // Verify customer authentication
        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        // Fetch existing orders from backend
        const data = await getAllOrders();

        if (active) {
          setOrders(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load orders"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [router]);

  // Search, filter and sort orders
  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders
      .filter((order) => {
        // Filter by status
        const matchesStatus =
          statusFilter === "all" ||
          order.status === statusFilter;

        // Search by full or partial order ID
        const matchesOrderId = order._id
          .toLowerCase()
          .includes(query);

        // Search by food item name
        const matchesFoodName = order.items.some(
          (item) =>
            item.name.toLowerCase().includes(query)
        );

        return (
          matchesStatus &&
          (matchesOrderId || matchesFoodName)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();

        return sort === "newest"
          ? dateB - dateA
          : dateA - dateB;
      });
  }, [orders, search, statusFilter, sort]);

  // Reset filters
  function handleClearFilters() {
    setSearch("");
    setStatusFilter("all");
    setSort("newest");
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    sort !== "newest";

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center">
        <div className="mx-auto mt-20">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

          <p className="text-gray-600">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Orders
          </h1>

          <p className="mt-2 text-gray-600">
            Track your orders and view your order history.
          </p>
        </div>

        {/* API error */}
        {error ? (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-6 text-red-700"
          >
            {error}
          </div>
        ) : orders.length === 0 ? (
          /* No orders in database */
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              No orders yet
            </h2>

            <p className="mt-3 text-gray-600">
              Your previous orders will appear here.
            </p>

            <Link
              href="/restaurants"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Search and filter controls */}
            <OrderHistoryFilters
              search={search}
              onSearchChange={setSearch}
              status={statusFilter}
              onStatusChange={setStatusFilter}
              sort={sort}
              onSortChange={setSort}
            />

            {/* Results count and reset */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-gray-600">
                Showing{" "}
                <span className="font-bold text-gray-900">
                  {filteredOrders.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">
                  {orders.length}
                </span>{" "}
                orders
              </p>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {/* Filtered order cards */}
            {filteredOrders.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                  />
                ))}
              </div>
            ) : (
              /* No matching orders */
              <div className="rounded-xl bg-white p-10 text-center shadow">
                <h2 className="text-xl font-semibold text-gray-900">
                  No matching orders found
                </h2>

                <p className="mt-3 text-gray-600">
                  Try a different search term or order
                  status.
                </p>

                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="mt-6 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
