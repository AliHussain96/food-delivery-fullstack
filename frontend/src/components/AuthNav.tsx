
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { logoutUser } from "@/services/authService";

export default function AuthNav() {
  const router = useRouter();

  const { user, authLoading, clearUser } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  // Handle user logout
  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    setError("");

    try {
      // Step 1: Logout from backend
      await logoutUser();

      // Step 2: Clear global authentication state
      clearUser();

      // Step 3: Redirect to login page
      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);

      setError(
        "Unable to logout. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  // Loading authentication state
  if (authLoading) {
    return (
      <span className="text-sm text-gray-500">
        Checking session...
      </span>
    );
  }

  // Guest navigation
  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link
          href="/login"
          className="font-medium text-gray-700 transition hover:text-orange-600"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600"
        >
          Register
        </Link>
      </div>
    );
  }

  // Authenticated user navigation
  return (
    <div className="flex flex-wrap items-center gap-4">

      {/* Admin Dashboard link */}
      {user.role === "admin" && (
        <Link
          href="/admin"
          className="rounded-lg bg-orange-100 px-4 py-2 font-semibold text-orange-700 transition hover:bg-orange-200"
        >
          Admin Dashboard
        </Link>
      )}

      {/* User greeting */}
      <span className="text-sm font-medium text-gray-700">
        Hi, {user.name}
      </span>

      {/* Logout button */}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>

      {/* Logout error message */}
      {error && (
        <p
          role="alert"
          className="w-full text-sm text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}
