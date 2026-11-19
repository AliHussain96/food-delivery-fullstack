
"use client";

import { useState, type FormEvent } from "react";
import type {
  MenuItem,
  MenuItemInput,
} from "@/types/management";

interface Props {
  initialData?: MenuItem | null;
  onSave: (data: MenuItemInput) => Promise<void>;
  onCancel: () => void;
}

export default function MenuItemForm({
  initialData,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<MenuItemInput>({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price ?? 0,
    image: initialData?.image ?? "",
    category: initialData?.category ?? "",
    isAvailable: initialData?.isAvailable ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function change(
    field: keyof MenuItemInput,
    value: string | number | boolean
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
        description: form.description.trim(),
        image: form.image.trim(),
        category: form.category.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save menu item"
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
        {initialData ? "Edit Food Item" : "Add Food Item"}
      </h2>

      <label className="block text-sm text-gray-700">
        Food Name
        <input
          required
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
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

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-gray-700">
          Price (₹)
          <input
            type="number"
            min={0}
            step="0.01"
            required
            value={form.price}
            onChange={(e) =>
              change("price", Number(e.target.value))
            }
            className="mt-1 w-full rounded-lg border p-3 text-gray-900"
          />
        </label>

        <label className="block text-sm text-gray-700">
          Category
          <input
            required
            placeholder="Pizza, Burger, Drinks"
            value={form.category}
            onChange={(e) =>
              change("category", e.target.value)
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
          value={form.image}
          onChange={(e) => change("image", e.target.value)}
          className="mt-1 w-full rounded-lg border p-3 text-gray-900"
        />
      </label>

      <label className="flex items-center gap-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={form.isAvailable}
          onChange={(e) =>
            change("isAvailable", e.target.checked)
          }
          className="h-4 w-4 accent-orange-500"
        />
        Available for ordering
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
          {saving ? "Saving..." : "Save Food Item"}
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
