
import type { AdminOrder } from "@/types/admin";

interface AdminStatsProps {
  orders: AdminOrder[];
}

export default function AdminStats({
  orders,
}: AdminStatsProps) {
  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  // Revenue from delivered orders only
  const totalRevenue = orders
    .filter((order) => order.status === "delivered")
    .reduce(
      (total, order) => total + order.totalAmount,
      0
    );

  const stats = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      icon: "📦",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toString(),
      icon: "⏳",
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      title: "Delivered Orders",
      value: deliveredOrders.toString(),
      icon: "✅",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Delivered Order Value",
      value: totalRevenue.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
      }),
      icon: "💰",
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-600">
              {stat.title}
            </p>

            <span
              className={`rounded-lg p-3 text-xl ${stat.color}`}
            >
              {stat.icon}
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">
            {stat.value}
          </h2>
        </div>
      ))}
    </section>
  );
}
