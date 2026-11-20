import mongoose, { Schema, Document } from "mongoose";

// TypeScript interface
export interface IRestaurant extends Document {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  description: string;
  // rating: number;
  totalReviews: number;
}

// Mongoose schema
const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
    },

    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
      trim: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryTime: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create model
const Restaurant = mongoose.model<IRestaurant>("Restaurant", restaurantSchema);

export default Restaurant;
