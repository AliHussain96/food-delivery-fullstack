
"use client";

import { useState, type FormEvent } from "react";
import type {
  Restaurant,
  RestaurantInput,
} from "@/types/management";

interface Props {
  initialData?: Restaurant | null;
  onSave: (data: RestaurantInput) => Promise<void>;
  onCancel: () => void;
}

export default function RestaurantForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<RestaurantInput>({
    name: initialData?.name ?? "",
    cuisine: initialData?.cuisine ?? "",
    rating: initialData?.rating ?? 0,
    deliveryTime: initialData?.deliveryTime ?? "",
    image: initialData?.image ?? "",
    description: initialData?.description ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function change(
    field: keyof RestaurantInput,
    value: string | number
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      await onSave({
        ...form,
        name: form.name.trim(),
        cuisine: form.cuisine.trim(),
        deliveryTime: form.deliveryTime.trim(),
        image: form.image.trim(),
        description: form.description.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save restaurant"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
    >
      <h2 className="text-xl font-bold text-gray-900">
        {initialData ? "Edit Restaurant" : "Add Restaurant"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-gray-700">
          Restaurant Name
          <input
            required
            value={form.name}
            onChange={(e) => change("name", e.target.value)}
            className="mt-1 w-full rounded-lg border p-3 text-gray-900"
          />
        </label>

        <label className="block text-sm text-gray-700">
          Cuisine
          <input
            required
            placeholder="Italian, Indian, Chinese"
            value={form.cuisine}
            onChange={(e) => change("cuisine", e.target.value)}
            className="mt-1 w-full rounded-lg border p-3 text-gray-900"
          />
        </label>

        <label className="block text-sm text-gray-700">
          Rating (0–5)
          <input
            type="number"
            required
            min={0}
            max={5}
            step="0.1"
            value={form.rating}
            onChange={(e) =>
              change("rating", Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border p-3 text-gray-900"
          />
        </label>

        <label className="block text-sm text-gray-700">
          Delivery Time
          <input
            required
            placeholder="25-35 min"
            value={form.deliveryTime}
            onChange={(e) =>
              change("deliveryTime", e.target.value)
            }
            className="mt-1 w-full rounded-lg border p-3 text-gray-900"
          />
        </label>
      </div>

      <label className="block text-sm text-gray-700">
        Image URL
        <input
          type="url"
          required
          placeholder="https://example.com/restaurant.jpg"
          value={form.image}
          onChange={(e) => change("image", e.target.value)}
          className="mt-1 w-full rounded-lg border p-3 text-gray-900"
        />
      </label>

      <label className="block text-sm text-gray-700">
        Description
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={(e) =>
            change("description", e.target.value)
          }
          className="mt-1 w-full rounded-lg border p-3 text-gray-900"
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-orange-500 px-5 py-2 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Restaurant"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-5 py-2 text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
