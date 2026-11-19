
import type {
  AdminOrder,
  OrderStatus,
} from "@/types/admin";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

async function adminRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(
    `${API_URL}/api/admin${endpoint}`,
    {
      ...options,
      credentials: "include",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    }
  );

  const result: ApiResponse<T> =
    await response.json();

  if (
    !response.ok ||
    !result.success ||
    result.data === undefined
  ) {
    throw new Error(
      result.message || "Admin request failed"
    );
  }

  return result.data;
}

// Fetch all customer orders
export async function getAdminOrders():
  Promise<AdminOrder[]> {
  return adminRequest<AdminOrder[]>("/orders");
}

// Update order status in MongoDB
export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<AdminOrder> {
  return adminRequest<AdminOrder>(
    `/orders/${encodeURIComponent(orderId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}
