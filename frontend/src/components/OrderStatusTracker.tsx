
import type { OrderStatus } from "@/types/order";

interface OrderStatusTrackerProps {
  status: OrderStatus;
}

const steps: {
  key: OrderStatus;
  label: string;
  description: string;
}[] = [
  {
    key: "pending",
    label: "Pending",
    description: "Order placed",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    description: "Order accepted",
  },
  {
    key: "preparing",
    label: "Preparing",
    description: "Food being prepared",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Order completed",
  },
];

export default function OrderStatusTracker({
  status,
}: OrderStatusTrackerProps) {
  if (status === "cancelled") {
    return (
      <div
        role="status"
        className="rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <h3 className="font-bold text-red-700">
          Order Cancelled
        </h3>
        <p className="mt-2 text-sm text-red-600">
          This order has been cancelled.
        </p>
      </div>
    );
  }

  const currentIndex = steps.findIndex(
    (step) => step.key === status
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-gray-900">
        Order Tracking
      </h2>

      <ol className="space-y-6">
        {steps.map((step, index) => {
          const completed = index <= currentIndex;
          const current = index === currentIndex;

          return (
            <li
              key={step.key}
              className="flex items-start gap-4"
              aria-current={current ? "step" : undefined}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                  completed
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index < currentIndex ? "✓" : index + 1}
              </div>

              <div>
                <h3
                  className={`font-semibold ${
                    completed
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                  {current && (
                    <span className="ml-2 text-xs text-orange-600">
                      Current
                    </span>
                  )}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
