
"use client";

import { useEffect } from "react";
import type { AdminOrder } from "@/types/admin";

interface AdminOrderDetailsProps {
  order: AdminOrder;
  onClose: () => void;
}

const formatPrice = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

export default function AdminOrderDetails({
  order,
  onClose,
}: AdminOrderDetailsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-details-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="admin-order-details-title"
              className="text-2xl font-bold text-gray-900"
            >
              Order #{order._id.slice(-8)}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleString(
                "en-IN",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                }
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            className="rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <section className="rounded-xl bg-gray-50 p-5">
            <h3 className="font-bold text-gray-900">
              Customer Details
            </h3>

            <p className="mt-3 text-gray-800">
              {order.customerName}
            </p>

            <p className="mt-2 text-gray-600">
              {order.phone}
            </p>

            <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-600">
              {order.address}
            </p>
          </section>

          <section className="rounded-xl bg-gray-50 p-5">
            <h3 className="font-bold text-gray-900">
              Order Information
            </h3>

            <p className="mt-3 text-sm text-gray-600">
              Status:{" "}
              <span className="font-semibold capitalize text-gray-900">
                {order.status}
              </span>
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Payment Method:{" "}
              <span className="font-semibold text-gray-900">
                {order.paymentMethod}
              </span>
            </p>

            <p className="mt-3 text-sm text-gray-600">
              Last Updated:{" "}
              {new Date(order.updatedAt).toLocaleString(
                "en-IN"
              )}
            </p>
          </section>
        </div>

        <section className="mt-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">
            Ordered Items
          </h3>

          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div
                key={`${item.menuItemId}-${index}`}
                className="flex justify-between gap-4 rounded-lg border border-gray-100 p-4"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatPrice(item.price)} ×{" "}
                    {item.quantity}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  {formatPrice(
                    item.price * item.quantity
                  )}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-between border-t border-gray-200 pt-5 text-lg font-bold">
            <span>Total Amount</span>

            <span className="text-orange-600">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </section>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
