
"use client";

import type { SavedAddress } from "@/types/address";

interface AddressCardProps {
  address: SavedAddress;
  busy: boolean;
  onEdit: (address: SavedAddress) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export default function AddressCard({
  address,
  busy,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-bold text-gray-900">
          {address.label}
        </h3>

        {address.isDefault && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Default
          </span>
        )}
      </div>

      <p className="mt-3 font-semibold text-gray-900">
        {address.fullName}
      </p>

      <p className="mt-1 text-gray-600">
        {address.phone}
      </p>

      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-700">
        {address.addressLine}
      </p>

      <p className="mt-1 text-sm text-gray-700">
        {address.city}, {address.state} - {address.pincode}
      </p>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          type="button"
          disabled={busy}
          onClick={() => onEdit(address)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Edit
        </button>

        {!address.isDefault && (
          <button
            type="button"
            disabled={busy}
            onClick={() => onSetDefault(address._id)}
            className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-50"
          >
            Set Default
          </button>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={() => onDelete(address._id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
