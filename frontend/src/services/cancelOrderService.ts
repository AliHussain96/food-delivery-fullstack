
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function cancelCustomerOrder(
  orderId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/orders/${encodeURIComponent(orderId)}/cancel`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to cancel order."
    );
  }
}
