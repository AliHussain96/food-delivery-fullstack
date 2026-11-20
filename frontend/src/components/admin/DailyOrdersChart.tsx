
import type {
  DailyOrderStats,
} from "@/types/analytics";

interface DailyOrdersChartProps {
  data: DailyOrderStats[];
}

export default function DailyOrdersChart({
  data,
}: DailyOrdersChartProps) {
  const maxOrders = Math.max(
    1,
    ...data.map((item) => item.orders)
  );

  return (
    <section className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-2 text-xl font-bold text-gray-900">
        Orders in the Last 7 Days
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Daily order volume based on UTC dates.
      </p>

      <div className="flex h-64 items-end gap-3 border-b border-gray-200 pb-2">
        {data.map((item) => {
          const height =
            (item.orders / maxOrders) * 100;

          const dateLabel = new Date(
            `${item.date}T00:00:00Z`
          ).toLocaleDateString("en-IN", {
            weekday: "short",
            timeZone: "UTC",
          });

          return (
            <div
              key={item.date}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-xs font-semibold text-gray-700">
                {item.orders}
              </span>

              <div
                className="w-full max-w-12 rounded-t-md bg-orange-500 transition-all"
                style={{
                  height: `${height}%`,
                  minHeight:
                    item.orders > 0 ? "4px" : "0px",
                }}
                title={`${item.date}: ${item.orders} orders`}
              />

              <span className="text-xs text-gray-500">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
