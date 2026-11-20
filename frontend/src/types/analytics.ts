
export interface DailyOrderStats {
  date: string;
  orders: number;
}

export interface DailyRevenueStats {
  date: string;
  revenue: number;
}

export interface DashboardAnalytics {
  totalOrders: number;
  totalRevenue: number;

  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;

  dailyOrders: DailyOrderStats[];
  dailyRevenue: DailyRevenueStats[];

  deliveryRate: number;
  averageOrderValue: number;
}
