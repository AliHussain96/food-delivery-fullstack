
import mongoose, {
  Schema,
  Document,
} from "mongoose";

export interface IRestaurant extends Document {
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  description: string;
  totalReviews: number;

  // Step 25: Restaurant location
  city?: string;
  area?: string;
  deliveryAreas: string[];
}

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

    // Restaurant city
    city: {
      type: String,
      trim: true,
    },

    // Restaurant neighborhood
    area: {
      type: String,
      trim: true,
    },

    // Supported delivery neighborhoods
    deliveryAreas: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Helps with location-based queries.
restaurantSchema.index({
  city: 1,
  deliveryAreas: 1,
});

const Restaurant =
  mongoose.models.Restaurant ||
  mongoose.model<IRestaurant>(
    "Restaurant",
    restaurantSchema
  );

export default Restaurant;