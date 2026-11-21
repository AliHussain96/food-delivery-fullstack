
export type AddressLabel = "Home" | "Work" | "Other";

// Address returned from MongoDB
export interface SavedAddress {
  _id: string;
  userId: string;
  label: AddressLabel;

  fullName: string;
  phone: string;

  addressLine: string;

  // Step 25.7: Delivery location
  area?: string;
  city: string;

  state: string;
  pincode: string;

  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Data sent when creating or updating an address
export interface AddressInput {
  label: AddressLabel;

  fullName: string;
  phone: string;

  addressLine: string;

  // Required for new and updated addresses
  area: string;
  city: string;

  state: string;
  pincode: string;
}
