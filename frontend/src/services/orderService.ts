
import type { Order } from "@/types/order";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  address: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const result: ApiResponse<T> = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message || `Request failed: ${response.status}`
    );
  }

  return result.data;
}

export async function placeOrder(
  orderData: PlaceOrderInput
): Promise<Order> {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(orderData),
  });

  return parseResponse<Order>(response);
}

export async function getAllOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<Order[]>(response);
}



/**
 * Fetch a single order by ID.
 */
export async function getOrderById(
  orderId: string
): Promise<Order> {
  const response = await fetch(
    `${API_URL}/api/orders/${encodeURIComponent(orderId)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseResponse<Order>(response);
}
