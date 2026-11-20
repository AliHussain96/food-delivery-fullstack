
"use client";

import { useState } from "react";
import { cancelCustomerOrder } from "@/services/cancelOrderService";

interface CancelOrderButtonProps {
  orderId: string;
  status: string;
  onCancelled: () => void | Promise<void>;
}

export default function CancelOrderButton({
  orderId,
  status,
  onCancelled,
}: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canCancel =
    status === "pending" || status === "confirmed";

  if (!canCancel) return null;

  async function handleCancel() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");

    try {
      await cancelCustomerOrder(orderId);
      await onCancelled();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to cancel order."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleCancel()}
        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Cancelling..." : "Cancel Order"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
