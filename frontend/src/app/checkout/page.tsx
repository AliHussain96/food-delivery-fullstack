
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";
import { getAddresses } from "@/services/addressService";

import type { SavedAddress } from "@/types/address";

import SavedAddressSelector from "@/components/checkout/SavedAddressSelector";

// Convert a saved address into the format expected by the order API.
function formatDeliveryAddress(item: SavedAddress): string {
  return [
    item.addressLine,
    item.city,
    item.state,
    item.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutPage() {
  const router = useRouter();

  // Existing cart functionality
  const {
    cart,
    totalItems,
    totalPrice,
    clearCart,
    loaded,
  } = useCart();

  // Manual delivery details
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Order submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Authentication
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<
    SavedAddress[]
  >([]);

  const [addressMode, setAddressMode] = useState<
    "saved" | "manual"
  >("manual");

  const [selectedAddressId, setSelectedAddressId] =
    useState("");

  const [addressesLoading, setAddressesLoading] =
    useState(true);

  const [addressesError, setAddressesError] =
    useState("");

  // Check authentication and load addresses.
  useEffect(() => {
    let active = true;

    async function initializeCheckout() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
        setCustomerName(user.name ?? "");

        try {
          const data = await getAddresses();

          if (!active) return;

          setSavedAddresses(data);

          if (data.length > 0) {
            const defaultAddress =
              data.find((item) => item.isDefault) ??
              data[0];

            setSelectedAddressId(defaultAddress._id);
            setAddressMode("saved");
          }
        } catch (addressError) {
          if (!active) return;

          setAddressesError(
            addressError instanceof Error
              ? addressError.message
              : "Unable to load saved addresses."
          );

          // Manual checkout remains available.
          setAddressMode("manual");
        }
      } catch (authError) {
        if (!active) return;

        console.error(
          "Authentication check failed:",
          authError
        );

        setError(
          "Unable to verify your login. Please try again."
        );
      } finally {
        if (active) {
          setAuthChecking(false);
          setAddressesLoading(false);
        }
      }
    }

    void initializeCheckout();

    return () => {
      active = false;
    };
  }, [router]);

  // Submit order
  const handlePlaceOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!isAuthenticated) {
      setError(
        "Please login before placing an order."
      );
      return;
    }

    if (!loaded || cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (addressesLoading) {
      setError(
        "Please wait while delivery addresses load."
      );
      return;
    }

    // Start with manually entered delivery details.
    let finalCustomerName = customerName.trim();
    let finalPhone = phone.trim();
    let finalAddress = address.trim();

    // Override details if a saved address is selected.
    if (addressMode === "saved") {
      const selected = savedAddresses.find(
        (item) => item._id === selectedAddressId
      );

      if (!selected) {
        setError(
          "Please select a valid saved delivery address."
        );
        return;
      }

      finalCustomerName = selected.fullName.trim();
      finalPhone = selected.phone.trim();
      finalAddress = formatDeliveryAddress(selected);
    }

    // Validate the final details, regardless of address mode.
    if (!finalCustomerName) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[0-9]{10}$/.test(finalPhone)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!finalAddress) {
      setError(
        "Please enter a valid delivery address."
      );
      return;
    }

    setLoading(true);

    try {
      // Existing order API — no backend changes required.
      const order = await placeOrder({
        customerName: finalCustomerName,
        phone: finalPhone,
        address: finalAddress,
        items: cart.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      });

      // Clear cart only after a successful order.
      clearCart();

      // Redirect to the existing success page.
      router.push(
        `/order-success?orderId=${encodeURIComponent(
          order._id
        )}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Wait until authentication and cart data have loaded.
  if (authChecking || !loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

          <p className="text-lg font-medium text-gray-700">
            Preparing your checkout...
          </p>
        </div>
      </main>
    );
  }

  // Authentication required
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Login Required
          </h1>

          <p className="mt-4 text-gray-600">
            Please login to your FoodNest account before
            placing an order.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-4 text-sm text-red-600"
            >
              {error}
            </p>
          )}

          <Link
            href="/login"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  // Empty cart
  if (cart.length === 0 && !loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-16">
        <div className="mx-auto max-w-xl rounded-xl bg-white p-10 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-600">
            Add some delicious food before checking out.
          </p>

          <Link
            href="/restaurants"
            className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Explore Restaurants
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Delivery details and order form */}
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-6 rounded-xl bg-white p-6 shadow lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Details
            </h2>

            {/* Address selection */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Choose Delivery Address
              </h3>

              {addressesLoading ? (
                <p className="text-sm text-gray-600">
                  Loading saved addresses...
                </p>
              ) : (
                <>
                  {addressesError && (
                    <p
                      role="alert"
                      className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800"
                    >
                      Saved addresses could not be loaded:{" "}
                      {addressesError}
                      <span className="mt-1 block">
                        You can still enter your delivery
                        details manually.
                      </span>
                    </p>
                  )}

                  {savedAddresses.length > 0 && (
                    <div className="flex flex-wrap gap-5">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="radio"
                          name="addressMode"
                          checked={addressMode === "saved"}
                          disabled={loading}
                          onChange={() =>
                            setAddressMode("saved")
                          }
                          className="accent-orange-500"
                        />
                        Use Saved Address
                      </label>

                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                        <input
                          type="radio"
                          name="addressMode"
                          checked={addressMode === "manual"}
                          disabled={loading}
                          onChange={() =>
                            setAddressMode("manual")
                          }
                          className="accent-orange-500"
                        />
                        Enter Manually
                      </label>
                    </div>
                  )}

                  {addressMode === "saved" &&
                    savedAddresses.length > 0 && (
                      <SavedAddressSelector
                        addresses={savedAddresses}
                        selectedId={selectedAddressId}
                        onSelect={setSelectedAddressId}
                        disabled={loading}
                      />
                    )}

                  {savedAddresses.length === 0 &&
                    !addressesError && (
                      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                        No saved addresses found. Enter your
                        delivery details below, or add a
                        saved address for future orders.
                      </p>
                    )}

                  <Link
                    href="/profile/addresses"
                    className="inline-block text-sm font-semibold text-orange-600 hover:underline"
                  >
                    Manage Saved Addresses
                  </Link>
                </>
              )}
            </section>

            {/* Manual delivery details */}
            {addressMode === "manual" && (
              <section className="space-y-5 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Enter Delivery Details
                </h3>

                {/* Full name */}
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Full Name
                  </label>

                  <input
                    id="customerName"
                    type="text"
                    required
                    maxLength={100}
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Mobile number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Mobile Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    required
                    maxLength={10}
                    pattern="[0-9]{10}"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                    placeholder="10-digit mobile number"
                  />
                </div>

                {/* Delivery address */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block font-medium text-gray-700"
                  >
                    Delivery Address
                  </label>

                  <textarea
                    id="address"
                    required
                    rows={4}
                    maxLength={500}
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-300 p-3 text-gray-900 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                    placeholder="House number, street, area, city, state and PIN code"
                  />
                </div>
              </section>
            )}

            {/* Payment method */}
            <section className="border-t border-gray-100 pt-6">
              <h3 className="mb-3 font-semibold text-gray-900">
                Payment Method
              </h3>

              <div className="rounded-lg border border-orange-300 bg-orange-50 p-4">
                <p className="font-semibold text-gray-900">
                  Cash on Delivery (COD)
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Pay when your order is delivered.
                </p>
              </div>
            </section>

            {/* Order error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Place order */}
            <button
              type="submit"
              disabled={
                loading ||
                addressesLoading ||
                !isAuthenticated
              }
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Placing Order..."
                : addressesLoading
                  ? "Loading Addresses..."
                  : "Place Order"}
            </button>
          </form>

          {/* Existing order summary */}
          <aside className="h-fit rounded-xl bg-white p-6 shadow">
            <h2 className="mb-5 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between gap-3 text-sm text-gray-700"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="mb-2 flex justify-between text-gray-700">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>Estimated Total</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              The final amount is calculated using current
              menu prices on the server.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
