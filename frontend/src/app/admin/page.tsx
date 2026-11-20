"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import AdminStats from "@/components/admin/AdminStats";
import AdminOrderTable from "@/components/admin/AdminOrderTable";
import AdminOrderFilters, {
  type AdminOrderSort,
} from "@/components/admin/AdminOrderFilters";

import DashboardStats from "@/components/admin/DashboardStats";
import DailyOrdersChart from "@/components/admin/DailyOrdersChart";

import RevenueChart from "@/components/admin/RevenueChart";
import OrderStatusChart from "@/components/admin/OrderStatusChart";

import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/services/adminService";

import { getDashboardAnalytics } from "@/services/analyticsService";

import type { AdminOrder, OrderStatus } from "@/types/admin";

import type { DashboardAnalytics } from "@/types/analytics";

export default function AdminDashboardPage() {
  const router = useRouter();

  const { user, authLoading } = useAuth();

  // Existing order states
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Analytics states
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  const [analyticsError, setAnalyticsError] = useState("");

  // Existing filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<AdminOrderSort>("newest");

  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  // Filter and sort orders
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

  // Fetch orders and analytics
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    setAnalyticsError("");

    try {
      const [ordersResult, analyticsResult] = await Promise.allSettled([
        getAdminOrders(),
        getDashboardAnalytics(),
      ]);

      if (ordersResult.status === "fulfilled") {
        setOrders(ordersResult.value);
      } else {
        setError(
          ordersResult.reason instanceof Error
            ? ordersResult.reason.message
            : "Failed to load orders",
        );
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics(analyticsResult.value);
      } else {
        setAnalytics(null);

        setAnalyticsError(
          analyticsResult.reason instanceof Error
            ? analyticsResult.reason.message
            : "Failed to load analytics",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Authentication and dashboard initialization
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

    void loadDashboard();
  }, [authLoading, user, router, loadDashboard]);

  // Update order status
  async function handleStatusChange(orderId: string, status: OrderStatus) {
    if (!isAdmin || updatingOrderId !== null) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError("");
    setSuccess("");

    try {
      const updatedOrder = await updateAdminOrderStatus(orderId, status);

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId ? updatedOrder : order,
        ),
      );

      setSuccess(`Order #${orderId.slice(-8)} updated to ${status}.`);

      // Refresh analytics after the status changes.
      try {
        const updatedAnalytics = await getDashboardAnalytics();

        setAnalytics(updatedAnalytics);
        setAnalyticsError("");
      } catch (err) {
        setAnalyticsError(
          err instanceof Error ? err.message : "Failed to refresh analytics",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // Authentication loading
  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Checking authentication...</p>
      </main>
    );
  }

  // Restrict admin interface
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

            {/* Admin navigation */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/restaurants"
                className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
              >
                Manage Restaurants
              </Link>

              <Link
                href="/admin/menu"
                className="rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white hover:bg-gray-900"
              >
                Manage Menu
              </Link>
            </div>

            <p className="mt-3 text-gray-600">
              Welcome, {user.name}. Manage your restaurant orders and view
              business analytics.
            </p>
          </div>

          {/* Dashboard actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void loadDashboard()}
              disabled={loading || updatingOrderId !== null}
              className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? "Refreshing..." : "Refresh Dashboard"}
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

        {/* Analytics error */}
        {analyticsError && (
          <div
            role="alert"
            className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800"
          >
            Analytics: {analyticsError}
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

        {loading ? (
          <div className="rounded-xl bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* New analytics section */}
            {analytics && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Business Analytics
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Statistics calculated from MongoDB orders.
                  </p>
                </div>

                <DashboardStats analytics={analytics} />

                <div className="grid gap-6 lg:grid-cols-2">
                  <DailyOrdersChart data={analytics.dailyOrders} />

                  <RevenueChart data={analytics.dailyRevenue} />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <OrderStatusChart analytics={analytics} />

                  <section className="rounded-xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900">
                      Delivery Performance
                    </h2>

                    <div className="mt-6 space-y-6">
                      <div>
                        <p className="text-sm text-gray-500">Delivery Rate</p>

                        <p className="mt-2 text-3xl font-bold text-green-600">
                          {analytics.deliveryRate}%
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Average Delivered Order Value
                        </p>

                        <p className="mt-2 text-3xl font-bold text-orange-600">
                          ₹{analytics.averageOrderValue.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Cancelled Orders
                        </p>

                        <p className="mt-2 text-3xl font-bold text-red-600">
                          {analytics.cancelledOrders}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </section>
            )}

            {/* Existing admin order statistics */}
            <section className="space-y-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Order Management
              </h2>

              <AdminStats orders={orders} />

              {/* Existing search/filter controls */}
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

              {/* Existing order table */}
              <AdminOrderTable
                orders={filteredOrders}
                updatingOrderId={updatingOrderId}
                onStatusChange={handleStatusChange}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
