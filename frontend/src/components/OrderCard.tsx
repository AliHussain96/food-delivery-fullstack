
import type { Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
  order: Order;
}

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.createdAt).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  return (
    <article className="rounded-xl bg-white p-6 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Order #{order._id.slice(-8)}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {formattedDate}
          </p>
        </div>

        <span
          className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
            statusColors[order.status] || "bg-gray-100 text-gray-700"
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="mt-5 space-y-3 border-t border-gray-100 pt-4">
        {order.items.map((item, index) => (
          <div
            key={`${item.menuItemId}-${index}`}
            className="flex justify-between gap-4 text-gray-700"
          >
            <span>
              {item.name} × {item.quantity}
            </span>

            <span>
              ₹{item.price * item.quantity}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-between border-t border-gray-100 pt-4">
        <span className="font-semibold text-gray-900">
          Total Amount
        </span>

        <span className="text-xl font-bold text-orange-600">
          ₹{order.totalAmount}
        </span>
      </div>
    </article>
  );
}
