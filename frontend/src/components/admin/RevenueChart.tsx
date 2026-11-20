
"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import type {
  DailyRevenueStats,
} from "@/types/analytics";

interface RevenueChartProps {
  data: DailyRevenueStats[];
}

export default function RevenueChart({
  data,
}: RevenueChartProps) {
  const formattedData = data.map((item) => ({
    date: new Date(
      `${item.date}T00:00:00Z`
    ).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }),
    revenue: item.revenue,
  }));

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Revenue Trends
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Delivered order revenue for the last 7 days.
      </p>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) =>
                `₹${value}`
              }
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value ?? 0).toLocaleString("en-IN")}`,
                "Revenue",
              ]}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f97316"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
