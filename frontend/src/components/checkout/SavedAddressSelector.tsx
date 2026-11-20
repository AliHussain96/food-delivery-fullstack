
"use client";

import type { SavedAddress } from "@/types/address";

interface Props {
  addresses: SavedAddress[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export default function SavedAddressSelector({
  addresses,
  selectedId,
  onSelect,
  disabled = false,
}: Props) {
  if (addresses.length === 0) {
    return (
      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        You have no saved addresses yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <label
          key={address._id}
          className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${
            selectedId === address._id
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="savedAddress"
            value={address._id}
            checked={selectedId === address._id}
            disabled={disabled}
            onChange={() => onSelect(address._id)}
            className="mt-1 accent-orange-500"
          />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-900">
                {address.label}
              </span>

              {address.isDefault && (
                <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                  Default
                </span>
              )}
            </div>

            <p className="mt-2 font-medium text-gray-900">
              {address.fullName}
            </p>

            <p className="text-sm text-gray-600">
              {address.phone}
            </p>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-700">
              {address.addressLine}
            </p>

            <p className="text-sm text-gray-700">
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </label>
      ))}
    </div>
  );
}
