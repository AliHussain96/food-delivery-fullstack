import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  userId: mongoose.Types.ObjectId;
  label: "Home" | "Work" | "Other";
  fullName: string;
  phone: string;
  addressLine: string;
  area?: string; // NEW
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // Removed index: true to avoid duplicate index warning
    },

    label: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/,
    },

    addressLine: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/,
    },

    area: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Efficiently fetch user addresses, newest first.
addressSchema.index({
  userId: 1,
  createdAt: -1,
});

// Allow at most one default address per user.
addressSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDefault: true,
    },
  },
);

const Address =
  mongoose.models.Address || mongoose.model<IAddress>("Address", addressSchema);

export default Address as mongoose.Model<IAddress>;
