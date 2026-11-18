
import mongoose, { Schema, Document } from "mongoose";

// 1. TypeScript interface
export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId; // NEW FIELD
  customerName: string;
  phone: string;
  address: string;

  items: {
    menuItemId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];

  totalAmount: number;
  paymentMethod: "COD";

  status:
    | "pending"
    | "confirmed"
    | "preparing"
    | "delivered"
    | "cancelled";

  createdAt: Date;
  updatedAt: Date;
}

// 2. MongoDB schema
const orderSchema = new Schema<IOrder>(
  {
    // NEW FIELD: Connect order to logged-in user
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    items: [
      {
        menuItemId: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },

        name: {
          type: String,
          required: true,
        },

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD"],
      default: "COD",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// 3. Export model
const Order =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", orderSchema);

export default Order as mongoose.Model<IOrder>;
