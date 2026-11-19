"use client";

// import { useCallback, useEffect, useState } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import AdminStats from "@/components/admin/AdminStats";
import AdminOrderTable from "@/components/admin/AdminOrderTable";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/services/adminService";

import type { AdminOrder, OrderStatus } from "@/types/admin";

import AdminOrderFilters, {
  type AdminOrderSort,
} from "@/components/admin/AdminOrderFilters";

export default function AdminDashboardPage() {
  const router = useRouter();

  const { user, authLoading } = useAuth();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<AdminOrderSort>("newest");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.phone.includes(query);

      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

        case "highest":
          return b.totalAmount - a.totalAmount;

        case "lowest":
          return a.totalAmount - b.totalAmount;

        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    return result;
  }, [orders, search, statusFilter, sortBy]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication and load admin orders
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "admin") {
      router.replace("/");
      return;
    }

    void loadOrders();
  }, [authLoading, user, router, loadOrders]);

  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (!isAdmin || updatingOrderId !== null) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      // Save status in MongoDB through Express API
      const updatedOrder = await updateAdminOrderStatus(orderId, status);

      // Update local state after successful API response
      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      );

      setSuccess(`Order #${orderId.slice(-8)} updated to ${status}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // Wait for authentication to finish
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </main>
    );
  }

  // Never display admin data to non-admin users
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Redirecting...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              FoodNest Administration
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/restaurants"
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white"
              >
                Manage Restaurants
              </Link>

              <Link
                href="/admin/menu"
                className="rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white"
              >
                Manage Menu
              </Link>
            </div>

            <p className="mt-2 text-gray-600">
              Welcome, {user.name}. Manage your restaurant orders here.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => void loadOrders()}
              disabled={loading || updatingOrderId !== null}
              className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Orders"}
            </button>

            <Link
              href="/"
              className="rounded-lg border border-gray-300 bg-white px-5 py-2 font-semibold text-gray-700 hover:bg-gray-100"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700"
          >
            {success}
          </div>
        )}

        {/* Dashboard content */}
        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            <AdminStats orders={orders} />

            <AdminOrderFilters
              search={search}
              status={statusFilter}
              sortBy={sortBy}
              onSearchChange={setSearch}
              onStatusChange={setStatusFilter}
              onSortChange={setSortBy}
              onClear={() => {
                setSearch("");
                setStatusFilter("all");
                setSortBy("newest");
              }}
            />

            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>

            <AdminOrderTable
              orders={filteredOrders}
              updatingOrderId={updatingOrderId}
              onStatusChange={handleStatusChange}
            />
          </>
        )}
      </div>
    </main>
  );
}
