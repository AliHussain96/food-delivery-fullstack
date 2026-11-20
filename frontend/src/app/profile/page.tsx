
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

import {
  getProfile,
  updateProfile,
  type CustomerProfile,
} from "@/services/profileService";

export default function ProfilePage() {
  const router = useRouter();
  const { user, authLoading, refreshUser } = useAuth();

  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function loadProfile() {
      try {
        const data = await getProfile();

        if (!active) return;

        setProfile(data);
        setName(data.name);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load profile"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [authLoading, user, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await updateProfile(name.trim());

      setProfile(updated);
      setName(updated.name);

      await refreshUser();

      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || (user && loading)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading profile...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-10 text-center">
        Redirecting to login...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            My Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your FoodNest account.
          </p>
        </div>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold text-gray-900">
            Personal Information
          </h2>

          {error && (
            <p
              role="alert"
              className="mb-4 rounded-lg bg-red-50 p-3 text-red-700"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="mb-4 rounded-lg bg-green-50 p-3 text-green-700"
            >
              {success}
            </p>
          )}

          {profile && (
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="profile-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={100}
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 p-3 text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">
            Delivery Addresses
          </h2>

          <p className="mt-2 text-gray-600">
            Save your delivery addresses for faster checkout.
          </p>

          <Link
            href="/profile/addresses"
            className="mt-5 inline-block rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Manage Addresses
          </Link>
        </section>
      </div>
    </main>
  );
}
