
"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import type {
  DashboardAnalytics,
} from "@/types/analytics";

interface OrderStatusChartProps {
  analytics: DashboardAnalytics;
}

const COLORS = [
  "#f59e0b",
  "#3b82f6",
  "#8b5cf6",
  "#22c55e",
  "#ef4444",
];

export default function OrderStatusChart({
  analytics,
}: OrderStatusChartProps) {
  const data = [
    {
      name: "Pending",
      value: analytics.pendingOrders,
    },
    {
      name: "Confirmed",
      value: analytics.confirmedOrders,
    },
    {
      name: "Preparing",
      value: analytics.preparingOrders,
    },
    {
      name: "Delivered",
      value: analytics.deliveredOrders,
    },
    {
      name: "Cancelled",
      value: analytics.cancelledOrders,
    },
  ];

  const hasOrders = data.some(
    (item) => item.value > 0
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Order Status Distribution
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Current order status breakdown.
      </p>

      {!hasOrders ? (
        <div className="flex h-80 items-center justify-center text-gray-500">
          No orders available.
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {data.map((item, index) => (
                  <Cell
                    key={item.name}
                    fill={COLORS[index]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
