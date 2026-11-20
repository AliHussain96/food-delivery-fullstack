
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  checkFavorite,
  addFavorite,
  removeFavorite,
} from "@/services/favoriteService";

interface FavoriteButtonProps {
  restaurantId: string;
  onRemoved?: (restaurantId: string) => void;
}

export default function FavoriteButton({
  restaurantId,
  onRemoved,
}: FavoriteButtonProps) {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const loadFavorite = useCallback(async () => {
    if (!user) {
      setIsFavorite(false);
      setChecking(false);
      return;
    }

    setChecking(true);

    try {
      const result = await checkFavorite(restaurantId);
      setIsFavorite(result);
    } catch {
      setError("Unable to load favorite status");
    } finally {
      setChecking(false);
    }
  }, [restaurantId, user]);

  useEffect(() => {
    if (!authLoading) {
      void loadFavorite();
    }
  }, [authLoading, loadFavorite]);

  async function handleToggle() {
    if (loading || checking || authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isFavorite) {
        await removeFavorite(restaurantId);
        setIsFavorite(false);
        onRemoved?.(restaurantId);
      } else {
        await addFavorite(restaurantId);
        setIsFavorite(true);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update favorite"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || checking || authLoading}
        aria-label={
          isFavorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        aria-pressed={isFavorite}
        title={
          isFavorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
        className={`flex h-11 w-11 items-center justify-center rounded-full border bg-white text-2xl shadow-md transition hover:scale-110 disabled:cursor-wait disabled:opacity-60 ${
          isFavorite
            ? "border-red-200 text-red-500"
            : "border-gray-200 text-gray-400 hover:text-red-500"
        }`}
      >
        {loading || checking ? (
          <span className="text-sm">...</span>
        ) : isFavorite ? (
          "♥"
        ) : (
          "♡"
        )}
      </button>

      {error && (
        <span
          role="alert"
          className="max-w-32 rounded bg-white p-1 text-center text-xs text-red-600"
        >
          {error}
        </span>
      )}
    </div>
  );
}
