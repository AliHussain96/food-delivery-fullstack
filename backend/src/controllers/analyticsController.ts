
import type { Request, Response } from "express";
import Order from "../models/Orders";

interface DailyOrderAggregate {
  _id: string;
  orders: number;
}

interface DailyRevenueAggregate {
  _id: string;
  revenue: number;
}

interface RevenueAggregate {
  _id: null;
  totalRevenue: number;
}

export const getDashboardAnalytics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const now = new Date();

    const todayUTC = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
      )
    );

    const startDate = new Date(todayUTC);
    startDate.setUTCDate(startDate.getUTCDate() - 6);

    const endDate = new Date(todayUTC);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      dailyOrderResult,
      dailyRevenueResult,
    ] = await Promise.all([
      Order.countDocuments(),

      Order.countDocuments({ status: "pending" }),

      Order.countDocuments({ status: "confirmed" }),

      Order.countDocuments({ status: "preparing" }),

      Order.countDocuments({ status: "delivered" }),

      Order.countDocuments({ status: "cancelled" }),

      // Total value of delivered orders
      Order.aggregate<RevenueAggregate>([
        {
          $match: {
            status: "delivered",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      // Orders placed during the last seven UTC days
      Order.aggregate<DailyOrderAggregate>([
        {
          $match: {
            createdAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "UTC",
              },
            },
            orders: {
              $sum: 1,
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      // Delivered orders grouped by delivery date
      Order.aggregate<DailyRevenueAggregate>([
        {
          $match: {
            status: "delivered",
            updatedAt: {
              $gte: startDate,
              $lt: endDate,
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$updatedAt",
                timezone: "UTC",
              },
            },
            revenue: {
              $sum: "$totalAmount",
            },
          },
        },
        {
          $sort: {
            _id: 1,
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult[0]?.totalRevenue ?? 0;

    const deliveryRate =
      totalOrders > 0
        ? Number(
            (
              (deliveredOrders / totalOrders) *
              100
            ).toFixed(2)
          )
        : 0;

    const averageOrderValue =
      deliveredOrders > 0
        ? Number(
            (
              totalRevenue / deliveredOrders
            ).toFixed(2)
          )
        : 0;

    const dailyOrderMap = new Map(
      dailyOrderResult.map((item) => [
        item._id,
        item.orders,
      ])
    );

    const dailyRevenueMap = new Map(
      dailyRevenueResult.map((item) => [
        item._id,
        item.revenue,
      ])
    );

    const dates = Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date(startDate);
        date.setUTCDate(
          startDate.getUTCDate() + index
        );

        return date.toISOString().slice(0, 10);
      }
    );

    const dailyOrders = dates.map((date) => ({
      date,
      orders: dailyOrderMap.get(date) ?? 0,
    }));

    const dailyRevenue = dates.map((date) => ({
      date,
      revenue: dailyRevenueMap.get(date) ?? 0,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        deliveredOrders,
        cancelledOrders,
        dailyOrders,
        dailyRevenue,
        deliveryRate,
        averageOrderValue,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard analytics error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load dashboard analytics.",
    });
  }
};
