
import mongoose, {
  Schema,
  Document,
  Types,
} from "mongoose";

export interface IReview extends Document {
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number.",
      },
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from the same customer.
reviewSchema.index(
  { userId: 1, restaurantId: 1 },
  { unique: true }
);

reviewSchema.index({
  restaurantId: 1,
  createdAt: -1,
});

const Review =
  mongoose.models.Review ||
  mongoose.model<IReview>("Review", reviewSchema);

export default Review;
