
import { Suspense } from "react";

import OrderDetailsContent from "./OrderDetailsContent";

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
