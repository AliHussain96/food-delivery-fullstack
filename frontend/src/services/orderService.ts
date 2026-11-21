
import type { Order } from "@/types/order";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

// Updated for Step 25.7
export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  address: string;

  // Saved address checkout
  addressId?: string;

  // Manual address checkout
  city?: string;
  area?: string;

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
  let result: ApiResponse<T>;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Invalid server response: ${response.status}`
    );
  }

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message ||
        `Request failed: ${response.status}`
    );
  }

  return result.data;
}

// POST /api/orders
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

// GET /api/orders
export async function getAllOrders(): Promise<Order[]> {
  const response = await fetch(`${API_URL}/api/orders`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse<Order[]>(response);
}

// GET /api/orders/:id
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
