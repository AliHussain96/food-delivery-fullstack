
"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="mx-auto max-w-xl rounded-xl bg-white p-10 text-center shadow-lg">
      <div className="mb-6 text-6xl">🎉</div>

      <h1 className="text-3xl font-bold text-gray-900">
        Order Placed Successfully!
      </h1>

      <p className="mt-4 text-gray-600">
        Thank you for ordering from FoodNest.
      </p>

      {orderId && (
        <div className="mt-6 rounded-lg bg-gray-100 p-4">
          <p className="text-sm text-gray-500">Order ID</p>

          <p className="mt-2 break-all font-semibold text-gray-900">
            {orderId}
          </p>
        </div>
      )}

      <Link
        href="/restaurants"
        className="mt-8 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
      >
        Explore More Restaurants
      </Link>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16">
      <Suspense
        fallback={
          <p className="text-center text-gray-600">
            Loading order details...
          </p>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </main>
  );
}
