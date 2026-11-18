
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import OrderCard from "@/components/OrderCard";
import { getAllOrders } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";
import type { Order } from "@/types/order";

export default function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

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

    loadOrders();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-10 text-center">
        Loading your orders...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          My Orders
        </h1>

        {error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mt-3 text-gray-600">
              Your previous orders will appear here.
            </p>

            <Link
              href="/restaurants"
              className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-white"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
