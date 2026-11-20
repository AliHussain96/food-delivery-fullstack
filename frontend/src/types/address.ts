
export type AddressLabel = "Home" | "Work" | "Other";

export interface SavedAddress {
  _id: string;
  userId: string;
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddressInput {
  label: AddressLabel;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}
