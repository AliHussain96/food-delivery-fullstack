const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface DeliveryAvailabilityResponse {
  success: boolean;
  available: boolean;
  message: string;
}

export type DeliveryCheckLocation =
  | { addressId: string; city?: never; area?: never }
  | { addressId?: never; city: string; area: string };

type ApiDeliveryResponse = {
  success: boolean;
  available?: boolean;
  message?: string;
  data?: { available: boolean; message?: string };
};

// Existing callers can still pass (restaurantId, addressId).
// New checkout can pass (restaurantId, { city, area }) or
// (restaurantId, { addressId }), optionally with an AbortSignal.
export async function checkDeliveryAvailability(
  restaurantId: string,
  location: string | DeliveryCheckLocation,
  signal?: AbortSignal
): Promise<DeliveryAvailabilityResponse> {
  const locationPayload =
    typeof location === "string" ? { addressId: location } : location;

  const response = await fetch(`${API_URL}/api/delivery/check`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ restaurantId, ...locationPayload }),
    signal,
  });

  const result: ApiDeliveryResponse = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to check delivery availability");
  }

  const available = result.data?.available ?? result.available;
  if (typeof available !== "boolean") {
    throw new Error("Unexpected delivery availability response from server.");
  }

  return {
    success: true,
    available,
    message:
      result.data?.message ||
      result.message ||
      (available ? "Delivery available." : "Delivery unavailable."),
  };
}
