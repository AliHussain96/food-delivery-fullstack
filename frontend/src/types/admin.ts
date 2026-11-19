
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivered"
  | "cancelled";

export interface AdminOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface AdminOrder {
  _id: string;
  userId: string;
  customerName: string;
  phone: string;
  address: string;
  items: AdminOrderItem[];
  totalAmount: number;
  paymentMethod: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "delivered",
  "cancelled",
];
