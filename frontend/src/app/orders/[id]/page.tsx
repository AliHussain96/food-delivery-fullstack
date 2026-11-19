
"use client";

// import { useCallback, useEffect, useState } from "react";
import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { getOrderById } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";
import OrderStatusTracker from "@/components/OrderStatusTracker";
import type { Order } from "@/types/order";

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    const data = await getOrderById(orderId);
    setOrder(data);
    setError("");
  }, [orderId]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        setLoading(true);
        setOrder(null);
        setError("");

        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        const data = await getOrderById(orderId);

        if (active) {
          setOrder(data);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load order"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [orderId, router]);

  async function handleRefresh() {
    try {
      setRefreshing(true);
      await loadOrder();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to refresh order status"
      );
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center">
        Loading order details...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center">
        <p role="alert" className="text-red-600">
          {error || "Order not found"}
        </p>

        <Link
          href="/orders"
          className="mt-5 inline-block text-orange-600"
        >
          Back to My Orders
        </Link>
      </main>
    );
  }

  const formattedDate = new Date(
    order.createdAt
  ).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/orders"
          className="text-sm font-semibold text-orange-600"
        >
          ← Back to My Orders
        </Link>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Order #{order._id.slice(-8)}
            </h1>

            <p className="mt-2 text-gray-500">
              Placed on {formattedDate}
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Refresh Status"}
          </button>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg bg-red-50 p-4 text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <OrderStatusTracker status={order.status} />

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Ordered Items
              </h2>

              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.menuItemId}-${index}`}
                    className="flex justify-between gap-4 border-b border-gray-100 pb-4"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {item.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        ₹{item.price} × {item.quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-between text-lg font-bold">
                <span>Total Amount</span>
                <span className="text-orange-600">
                  ₹{order.totalAmount}
                </span>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Delivery Details
              </h2>

              <p className="font-semibold text-gray-900">
                {order.customerName}
              </p>

              <p className="mt-2 text-gray-600">
                {order.phone}
              </p>

              <p className="mt-3 whitespace-pre-wrap text-gray-600">
                {order.address}
              </p>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Payment Details
              </h2>

              <p className="text-gray-600">
                Method:{" "}
                <span className="font-semibold">
                  {order.paymentMethod}
                </span>
              </p>

              <p className="mt-3 font-semibold capitalize text-gray-900">
                Status: {order.status}
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}



export default function OrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />

            <p className="font-medium text-gray-600">
              Loading order details...
            </p>
          </div>
        </main>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}
