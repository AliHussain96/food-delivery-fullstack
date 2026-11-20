
export interface ReviewUser {
  _id: string;
  name: string;
}

export interface Review {
  _id: string;
  userId: ReviewUser | string;
  restaurantId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantReviewsResponse {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

export interface ReviewPayload {
  restaurantId: string;
  rating: number;
  comment: string;
}
