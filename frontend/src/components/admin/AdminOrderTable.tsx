
"use client";

import { useState } from "react";

import AdminOrderDetails from "@/components/admin/AdminOrderDetails";

import type {
  AdminOrder,
  OrderStatus,
} from "@/types/admin";

import { ORDER_STATUSES } from "@/types/admin";

interface AdminOrderTableProps {
  orders: AdminOrder[];
  updatingOrderId: string | null;
  onStatusChange: (
    orderId: string,
    status: OrderStatus
  ) => Promise<void>;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const formatPrice = (amount: number) =>
  amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

export default function AdminOrderTable({
  orders,
  updatingOrderId,
  onStatusChange,
}: AdminOrderTableProps) {
  const [selectedOrderId, setSelectedOrderId] =
    useState<string | null>(null);

  // Derive selected order from current props so updated
  // statuses are also reflected in the details modal.
  const selectedOrder =
    orders.find((order) => order._id === selectedOrderId) ??
    null;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Customer Orders
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View order details and manage delivery statuses.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="align-top transition hover:bg-gray-50"
              >
                <td className="px-4 py-4 font-semibold text-gray-900">
                  #{order._id.slice(-8)}
                </td>

                <td className="px-4 py-4">
                  <p className="font-semibold text-gray-900">
                    {order.customerName}
                  </p>

                  <p className="mt-1 text-gray-600">
                    {order.phone}
                  </p>
                </td>

                <td className="px-4 py-4 text-gray-700">
                  {order.items.map((item, index) => (
                    <p
                      key={`${item.menuItemId}-${index}`}
                      className="mb-1"
                    >
                      {item.name} × {item.quantity}
                    </p>
                  ))}
                </td>

                <td className="px-4 py-4 font-semibold text-gray-900">
                  {formatPrice(order.totalAmount)}
                </td>

                <td className="px-4 py-4 text-gray-600">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString("en-IN")}
                </td>

                <td className="px-4 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <select
                    aria-label={`Update status for order ${order._id}`}
                    value={order.status}
                    disabled={updatingOrderId !== null}
                    onChange={(event) =>
                      void onStatusChange(
                        order._id,
                        event.target.value as OrderStatus
                      )
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-50"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </option>
                    ))}
                  </select>

                  {updatingOrderId === order._id && (
                    <p className="mt-2 text-xs text-orange-600">
                      Saving...
                    </p>
                  )}
                </td>

                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedOrderId(order._id)
                    }
                    className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No matching orders found.
          </div>
        )}
      </div>

      {selectedOrder && (
        <AdminOrderDetails
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </section>
  );
}
