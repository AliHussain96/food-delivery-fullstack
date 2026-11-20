
import type {
  DashboardAnalytics,
} from "@/types/analytics";

interface DashboardStatsProps {
  analytics: DashboardAnalytics;
}

export default function DashboardStats({
  analytics,
}: DashboardStatsProps) {
  const cards = [
    {
      label: "Total Orders",
      value: analytics.totalOrders.toLocaleString("en-IN"),
      color: "text-blue-600",
    },
    {
      label: "Delivered Revenue",
      value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`,
      color: "text-green-600",
    },
    {
      label: "Pending Orders",
      value: analytics.pendingOrders.toLocaleString("en-IN"),
      color: "text-orange-600",
    },
    {
      label: "Delivered Orders",
      value: analytics.deliveredOrders.toLocaleString("en-IN"),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <p className="text-sm font-medium text-gray-500">
            {card.label}
          </p>

          <h3
            className={`mt-3 text-3xl font-bold ${card.color}`}
          >
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );
}
