
import mongoose from "mongoose";
import Review from "../models/Review";
import Restaurant from "../models/Restaurant";

interface RatingResult {
  _id: mongoose.Types.ObjectId;
  averageRating: number;
  totalReviews: number;
}

export async function updateRestaurantRating(
  restaurantId: string
): Promise<void> {
  const result = await Review.aggregate<RatingResult>([
    {
      $match: {
        restaurantId: new mongoose.Types.ObjectId(
          restaurantId
        ),
      },
    },
    {
      $group: {
        _id: "$restaurantId",
        averageRating: {
          $avg: "$rating",
        },
        totalReviews: {
          $sum: 1,
        },
      },
    },
  ]);

  const averageRating = result[0]
    ? Number(result[0].averageRating.toFixed(1))
    : 0;

  const totalReviews = result[0]?.totalReviews ?? 0;

  await Restaurant.findByIdAndUpdate(
    restaurantId,
    {
      $set: {
        rating: averageRating,
        totalReviews,
      },
    },
    {
      runValidators: true,
    }
  );
}
