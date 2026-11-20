
import type {
  Review,
  ReviewPayload,
  RestaurantReviewsResponse,
} from "@/types/review";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Review request failed"
    );
  }

  return result.data as T;
}

export async function getRestaurantReviews(
  restaurantId: string
): Promise<RestaurantReviewsResponse> {
  const response = await fetch(
    `${API_URL}/api/reviews/restaurant/${encodeURIComponent(
      restaurantId
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  return parseResponse<RestaurantReviewsResponse>(
    response
  );
}

export async function createReview(
  payload: ReviewPayload
): Promise<Review> {
  const response = await fetch(
    `${API_URL}/api/reviews`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return parseResponse<Review>(response);
}

export async function updateReview(
  reviewId: string,
  rating: number,
  comment: string
): Promise<Review> {
  const response = await fetch(
    `${API_URL}/api/reviews/${encodeURIComponent(
      reviewId
    )}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating,
        comment,
      }),
    }
  );

  return parseResponse<Review>(response);
}

export async function deleteReview(
  reviewId: string
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/reviews/${encodeURIComponent(
      reviewId
    )}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to delete review"
    );
  }
}
