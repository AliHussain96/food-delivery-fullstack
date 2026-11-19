
"use client";

import type { OrderStatus } from "@/types/admin";

export type AdminOrderSort =
  | "newest"
  | "oldest"
  | "highest"
  | "lowest";

interface AdminOrderFiltersProps {
  search: string;
  status: string;
  sortBy: AdminOrderSort;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: AdminOrderSort) => void;
  onClear: () => void;
}

const statuses: Array<OrderStatus | "all"> = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];

export default function AdminOrderFilters({
  search,
  status,
  sortBy,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onClear,
}: AdminOrderFiltersProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-gray-900">
        Find Orders
      </h2>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Search ID, customer or phone"
          aria-label="Search orders"
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
        />

        <select
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value)
          }
          aria-label="Filter by order status"
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item === "all"
                ? "All Statuses"
                : item.charAt(0).toUpperCase() +
                  item.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            onSortChange(
              event.target.value as AdminOrderSort
            )
          }
          aria-label="Sort orders"
          className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Amount</option>
          <option value="lowest">Lowest Amount</option>
        </select>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          Clear Filters
        </button>
      </div>
    </section>
  );
}
