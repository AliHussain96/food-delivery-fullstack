
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";

import {
  getRestaurantReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/services/reviewService";

import type {
  Review,
  RestaurantReviewsResponse,
} from "@/types/review";

interface RestaurantReviewsProps {
  restaurantId: string;
}

export default function RestaurantReviews({
  restaurantId,
}: RestaurantReviewsProps) {
  const { user, authLoading } = useAuth();

  const [reviewData, setReviewData] =
    useState<RestaurantReviewsResponse | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [editingReviewId, setEditingReviewId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getRestaurantReviews(restaurantId);

      setReviewData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load reviews"
      );
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const currentUserReview =
    reviewData?.reviews.find((review) => {
      const reviewUserId =
        typeof review.userId === "string"
          ? review.userId
          : review.userId?._id;

      return reviewUserId === user?._id;
    });

  function resetForm() {
    setRating(0);
    setComment("");
    setEditingReviewId(null);
  }

  function startEditing(review: Review) {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!user) {
      setError("Please login to submit a review.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating.");
      return;
    }

    if (
      comment.trim().length < 5 ||
      comment.trim().length > 1000
    ) {
      setError(
        "Review must contain between 5 and 1000 characters."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      if (editingReviewId) {
        await updateReview(
          editingReviewId,
          rating,
          comment.trim()
        );

        setSuccess("Review updated successfully!");
      } else {
        await createReview({
          restaurantId,
          rating,
          comment: comment.trim(),
        });

        setSuccess("Review submitted successfully!");
      }

      resetForm();
      await loadReviews();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save review"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete your review?"
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");

      await deleteReview(reviewId);

      resetForm();
      await loadReviews();

      setSuccess("Review deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete review"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderStars(value: number) {
    return (
      <span className="text-xl text-yellow-500">
        {"★".repeat(value)}
        <span className="text-gray-300">
          {"☆".repeat(5 - value)}
        </span>
      </span>
    );
  }

  return (
    <section
      id="reviews"
      className="mt-12 rounded-xl bg-white p-6 shadow-lg md:p-8"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Customer Reviews & Ratings
        </h2>

        <p className="mt-2 text-gray-500">
          Share your experience with this restaurant.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg bg-red-50 p-4 text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="mb-5 rounded-lg bg-green-50 p-4 text-green-700"
        >
          {success}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : (
        <>
          {/* Average restaurant rating */}
          <div className="mb-8 rounded-xl bg-orange-50 p-6">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-5xl font-bold text-gray-900">
                {reviewData?.averageRating.toFixed(1) ??
                  "0.0"}
              </span>

              <div>
                {renderStars(
                  Math.round(
                    reviewData?.averageRating ?? 0
                  )
                )}

                <p className="mt-1 text-sm text-gray-600">
                  Based on {reviewData?.totalReviews ?? 0} reviews
                </p>
              </div>
            </div>
          </div>

          {/* Review submission form */}
          {!authLoading && !user && (
            <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-5">
              <p className="font-medium text-gray-800">
                Want to rate this restaurant?
              </p>

              <Link
                href="/login"
                className="mt-3 inline-block rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600"
              >
                Login to Write a Review
              </Link>
            </div>
          )}

          {user && (!currentUserReview || editingReviewId) && (
            <form
              onSubmit={handleSubmit}
              className="mb-10 rounded-xl border border-gray-200 p-6"
            >
              <h3 className="mb-4 text-xl font-bold text-gray-900">
                {editingReviewId
                  ? "Edit Your Review"
                  : "Write a Review"}
              </h3>

              <p className="mb-3 font-medium text-gray-700">
                Select your rating
              </p>

              <div
                className="mb-5 flex gap-2"
                role="group"
                aria-label="Select restaurant rating"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    aria-label={`Rate ${star} stars`}
                    aria-pressed={rating === star}
                    className={`text-4xl transition hover:scale-110 ${
                      star <= rating
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <label
                htmlFor="review-comment"
                className="mb-2 block font-medium text-gray-700"
              >
                Your Review
              </label>

              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) =>
                  setComment(event.target.value)
                }
                rows={4}
                maxLength={1000}
                placeholder="Tell us about your food experience..."
                className="w-full rounded-lg border border-gray-300 p-4 text-gray-900 outline-none focus:border-orange-500"
                required
              />

              <p className="mt-1 text-right text-sm text-gray-500">
                {comment.length}/1000
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingReviewId
                    ? "Update Review"
                    : "Submit Review"}
                </button>

                {editingReviewId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}

          {currentUserReview && !editingReviewId && (
            <div className="mb-8 rounded-lg bg-green-50 p-4 text-green-800">
              You have already reviewed this restaurant.
              You can edit or delete your review below.
            </div>
          )}

          {/* Customer reviews list */}
          <div>
            <h3 className="mb-5 text-2xl font-bold text-gray-900">
              All Reviews ({reviewData?.totalReviews ?? 0})
            </h3>

            {reviewData?.reviews.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <p className="text-gray-500">
                  No reviews yet. Be the first to review!
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {reviewData?.reviews.map((review) => {
                  const reviewUserId =
                    typeof review.userId === "string"
                      ? review.userId
                      : review.userId?._id;

                  const reviewerName =
                    typeof review.userId === "string"
                      ? "Customer"
                      : review.userId?.name ?? "Customer";

                  const isOwner =
                    Boolean(user) &&
                    reviewUserId === user?._id;

                  return (
                    <article
                      key={review._id}
                      className="rounded-xl border border-gray-200 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-gray-900">
                            {reviewerName}
                          </h4>

                          <p className="mt-1 text-sm text-gray-500">
                            {new Date(
                              review.createdAt
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        {renderStars(review.rating)}
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-gray-700">
                        {review.comment}
                      </p>

                      {isOwner && (
                        <div className="mt-5 flex gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              startEditing(review)
                            }
                            disabled={submitting}
                            className="rounded-lg bg-blue-50 px-4 py-2 font-semibold text-blue-700 hover:bg-blue-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(review._id)
                            }
                            disabled={submitting}
                            className="rounded-lg bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
