
"use client";

export type OrderStatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export type OrderSort = "newest" | "oldest";

interface OrderHistoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: OrderStatusFilter;
  onStatusChange: (value: OrderStatusFilter) => void;
  sort: OrderSort;
  onSortChange: (value: OrderSort) => void;
}

export default function OrderHistoryFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
}: OrderHistoryFiltersProps) {
  return (
    <div className="grid gap-4 rounded-xl border border-gray-200 bg-white p-5 md:grid-cols-3">
      <div>
        <label
          htmlFor="order-search"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Search Orders
        </label>

        <input
          id="order-search"
          type="search"
          value={search}
          onChange={(event) =>
            onSearchChange(event.target.value)
          }
          placeholder="Order ID or food name"
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        />
      </div>

      <div>
        <label
          htmlFor="order-status"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Order Status
        </label>

        <select
          id="order-status"
          value={status}
          onChange={(event) =>
            onStatusChange(
              event.target.value as OrderStatusFilter
            )
          }
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="preparing">Preparing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="order-sort"
          className="mb-2 block text-sm font-semibold text-gray-700"
        >
          Sort By
        </label>

        <select
          id="order-sort"
          value={sort}
          onChange={(event) =>
            onSortChange(event.target.value as OrderSort
            )
          }
          className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
