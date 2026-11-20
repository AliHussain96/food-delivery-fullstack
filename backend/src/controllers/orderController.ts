
import { Response } from "express";
import mongoose from "mongoose";
import Order from "../models/Orders";
import MenuItem from "../models/MenuItem";
import { AuthRequest } from "../middleware/authMiddleware";

// POST /api/orders
export async function createOrder(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const { customerName, phone, address, items } = req.body ?? {};

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Please login to place an order",
      });
      return;
    }

    if (
      typeof customerName !== "string" ||
      !customerName.trim() ||
      typeof phone !== "string" ||
      !/^[0-9]{10}$/.test(phone) ||
      typeof address !== "string" ||
      !address.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid checkout details",
      });
      return;
    }

    const validItems = items.every(
      (item: unknown) => {
        if (!item || typeof item !== "object") return false;

        const entry = item as Record<string, unknown>;

        return (
          typeof entry.menuItemId === "string" &&
          mongoose.isValidObjectId(entry.menuItemId) &&
          typeof entry.quantity === "number" &&
          Number.isInteger(entry.quantity) &&
          entry.quantity > 0 &&
          entry.quantity <= 100
        );
      }
    );

    if (!validItems) {
      res.status(400).json({
        success: false,
        message: "Invalid order items",
      });
      return;
    }

    const requestedItems = items as {
      menuItemId: string;
      quantity: number;
    }[];

    // Combine duplicate menu item IDs.
    const quantities = new Map<string, number>();

    for (const item of requestedItems) {
      const current = quantities.get(item.menuItemId) ?? 0;
      const next = current + item.quantity;

      if (next > 100) {
        res.status(400).json({
          success: false,
          message: "Maximum quantity is 100 per item",
        });
        return;
      }

      quantities.set(item.menuItemId, next);
    }

    const menuItems = await MenuItem.find({
      _id: { $in: [...quantities.keys()] },
      isAvailable: true,
    });

    if (menuItems.length !== quantities.size) {
      res.status(400).json({
        success: false,
        message: "One or more menu items are unavailable",
      });
      return;
    }

    const orderItems = menuItems.map((menuItem) => ({
      menuItemId: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: quantities.get(String(menuItem._id))!,
    }));

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId,
      customerName: customerName.trim(),
      phone,
      address: address.trim(),
      items: orderItems,
      totalAmount,
      paymentMethod: "COD",
      status: "pending",
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("Create order error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
}

// GET /api/orders
export async function getOrders(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const orders = await Order.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
}


/**
 * GET /api/orders/:id
 * Fetch an individual order belonging to the logged-in user.
 */
export async function getOrderById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Please login to view your order",
      });
      return;
    }

    if (
      typeof id !== "string" ||
      !mongoose.isValidObjectId(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
      return;
    }

    const order = await Order.findOne({
      _id: id,
      userId,
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order by ID error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
}

export const cancelOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.userId;
    const orderId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (
      typeof orderId !== "string" ||
      !mongoose.isValidObjectId(orderId)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
      });
      return;
    }

    // Atomic update prevents cancellation after
    // another request has advanced the order status.
    const cancelledOrder = await Order.findOneAndUpdate(
      {
        _id: orderId,
        userId,
        status: { $in: ["pending", "confirmed"] },
      },
      {
        $set: { status: "cancelled" },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (cancelledOrder) {
      res.status(200).json({
        success: true,
        message: "Order cancelled successfully.",
        data: cancelledOrder,
      });
      return;
    }

    // Check ownership without exposing another
    // customer's order details.
    const existingOrder = await Order.findOne({
      _id: orderId,
      userId,
    }).select("_id status");

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: "Order not found.",
      });
      return;
    }

    res.status(409).json({
      success: false,
      message:
        "This order can no longer be cancelled.",
    });
  } catch (error) {
    console.error("Cancel order error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to cancel order.",
    });
  }
};