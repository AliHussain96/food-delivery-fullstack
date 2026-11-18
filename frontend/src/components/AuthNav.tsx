
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

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logoutUser();

      clearUser();

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Unable to logout. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  if (authLoading) {
    return <span>Checking session...</span>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className="text-gray-700">
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-orange-500 px-4 py-2 text-white"
        >
          Register
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-gray-700">
        Hi, {user.name}
      </span>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="rounded-lg bg-red-500 px-4 py-2 text-white disabled:opacity-50"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );
}
