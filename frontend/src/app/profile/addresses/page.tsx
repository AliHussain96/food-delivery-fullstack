
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import AddressCard from "@/components/profile/AddressCard";

import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/services/addressService";

import type {
  AddressInput,
  SavedAddress,
} from "@/types/address";

const emptyForm: AddressInput = {
  label: "Home",
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
};

export default function SavedAddressesPage() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState<AddressInput>({
    ...emptyForm,
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAddresses = useCallback(async () => {
    const data = await getAddresses();
    setAddresses(data);
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;

    async function load() {
      try {
        const data = await getAddresses();
        if (active) setAddresses(data);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load addresses"
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [authLoading, user, router]);

  function updateField<K extends keyof AddressInput>(
    field: K,
    value: AddressInput[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function startAdd() {
    setEditingId(null);
    setForm({ ...emptyForm, fullName: user?.name ?? "" });
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function startEdit(address: SavedAddress) {
    setEditingId(address._id);

    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });

    setShowForm(true);
    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !/^[0-9]{10}$/.test(form.phone) ||
      !/^[0-9]{6}$/.test(form.pincode)
    ) {
      setError("Enter a valid phone number and 6-digit PIN code.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await updateAddress(editingId, form);
        setSuccess("Address updated successfully.");
      } else {
        await createAddress(form);
        setSuccess("Address added successfully.");
      }

      await loadAddresses();

      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save address"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this saved address?")) {
      return;
    }

    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await deleteAddress(id);
      await loadAddresses();

      if (editingId === id) {
        setEditingId(null);
        setShowForm(false);
      }

      setSuccess("Address deleted successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete address"
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleSetDefault(id: string) {
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await setDefaultAddress(id);
      await loadAddresses();

      setSuccess("Default address updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update default address"
      );
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || (user && loading)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading addresses...
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
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/profile"
          className="text-sm font-semibold text-orange-600 hover:underline"
        >
          ← Back to Profile
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Saved Addresses
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your FoodNest delivery locations.
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            disabled={busy}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            + Add Address
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="rounded-lg bg-green-50 p-4 text-green-700">
            {success}
          </p>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-xl bg-white p-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {editingId ? "Edit Address" : "Add New Address"}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Address Label</span>
                <select
                  value={form.label}
                  onChange={(event) =>
                    updateField(
                      "label",
                      event.target.value as AddressInput["label"]
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Full Name</span>
                <input
                  required
                  maxLength={100}
                  value={form.fullName}
                  onChange={(event) =>
                    updateField("fullName", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>Phone Number</span>
                <input
                  required
                  type="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  value={form.phone}
                  onChange={(event) =>
                    updateField("phone", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>City</span>
                <input
                  required
                  maxLength={100}
                  value={form.city}
                  onChange={(event) =>
                    updateField("city", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>State</span>
                <input
                  required
                  maxLength={100}
                  value={form.state}
                  onChange={(event) =>
                    updateField("state", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-gray-700">
                <span>PIN Code</span>
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={form.pincode}
                  onChange={(event) =>
                    updateField("pincode", event.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </label>
            </div>

            <label className="block space-y-2 text-sm font-medium text-gray-700">
              <span>Complete Address</span>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={form.addressLine}
                onChange={(event) =>
                  updateField("addressLine", event.target.value)
                }
                placeholder="House number, street, landmark and area"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
              >
                {busy
                  ? "Saving..."
                  : editingId
                    ? "Update Address"
                    : "Save Address"}
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              busy={busy}
              onEdit={startEdit}
              onDelete={(id) => void handleDelete(id)}
              onSetDefault={(id) => void handleSetDefault(id)}
            />
          ))}
        </div>

        {!loading && addresses.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              No saved addresses
            </h2>

            <p className="mt-2 text-gray-600">
              Add your first address to make checkout faster.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
