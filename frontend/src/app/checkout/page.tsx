
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";
import { getAddresses } from "@/services/addressService";
import { getRestaurants } from "@/services/restaurantService";
import { checkDeliveryAvailability } from "@/services/deliveryService";

import type { SavedAddress } from "@/types/address";
import SavedAddressSelector from "@/components/checkout/SavedAddressSelector";

// Supports the new area field while the address type
// is being updated for Step 25.7.
type DeliverySavedAddress = SavedAddress & {
  area?: string;
};

type CheckoutPayload = {
  customerName: string;
  phone: string;
  address: string;
  addressId?: string;
  city?: string;
  area?: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
};

function formatDeliveryAddress(
  item: DeliverySavedAddress
): string {
  return [
    item.addressLine,
    item.area,
    item.city,
    item.state,
    item.pincode,
  ]
    .filter(Boolean)
    .join(", ");
}

export default function CheckoutPage() {
  const router = useRouter();

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

  // Step 25.7: Structured delivery location
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryArea, setDeliveryArea] = useState("");

  // Available cities and delivery areas from restaurant records.
  const [restaurantLocations, setRestaurantLocations] = useState<
    { city?: string; deliveryAreas?: string[] }[]
  >([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsError, setLocationsError] = useState("");

  // Submission
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Authentication
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState<
    DeliverySavedAddress[]
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

  const selectedAddress = savedAddresses.find(
    (item) => item._id === selectedAddressId
  );

  const savedAddressHasArea =
    addressMode !== "saved" ||
    Boolean(selectedAddress?.area?.trim());

  // Initialize authentication and saved addresses.
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

  // Load supported delivery locations independently of saved addresses.
  useEffect(() => {
    let active = true;

    async function loadLocations() {
      try {
        const restaurants = await getRestaurants();
        if (!active) return;
        setRestaurantLocations(restaurants);
      } catch (err) {
        if (!active) return;
        setLocationsError(
          err instanceof Error
            ? err.message
            : "Unable to load delivery locations."
        );
      } finally {
        if (active) setLocationsLoading(false);
      }
    }

    void loadLocations();
    return () => {
      active = false;
    };
  }, []);

  // Normalize labels so differently cased database entries don't duplicate.
  const cityMap = new Map<string, string>();
  for (const restaurant of restaurantLocations) {
    const city = restaurant.city?.trim();
    if (city) cityMap.set(city.toLowerCase(), cityMap.get(city.toLowerCase()) ?? city);
  }
  const cities = [...cityMap.values()].sort((a, b) => a.localeCompare(b));

  const areaMap = new Map<string, string>();
  for (const restaurant of restaurantLocations) {
    if (restaurant.city?.trim().toLowerCase() !== deliveryCity.trim().toLowerCase()) continue;
    for (const rawArea of restaurant.deliveryAreas ?? []) {
      const area = rawArea.trim();
      if (area) areaMap.set(area.toLowerCase(), areaMap.get(area.toLowerCase()) ?? area);
    }
  }
  const areas = [...areaMap.values()].sort((a, b) => a.localeCompare(b));

  // Delivery check must use the restaurant actually in the cart.
  const restaurantIds = Array.from(
    new Set(cart.map((item) => item.restaurantId).filter((id): id is string => Boolean(id)))
  );
  const missingRestaurantId = cart.some((item) => !item.restaurantId);
  const singleRestaurantId =
    !missingRestaurantId && restaurantIds.length === 1 ? restaurantIds[0] : "";
  const cartRestaurantError = missingRestaurantId
    ? "Some cart items are missing their restaurant ID. Remove and re-add those items from the restaurant page."
    : restaurantIds.length > 1
      ? "Please order from one restaurant at a time."
      : "";

  const locationReady = addressMode === "saved"
    ? Boolean(selectedAddressId && selectedAddress?.area?.trim())
    : Boolean(deliveryCity.trim() && deliveryArea.trim());

  // A key prevents a previous location's successful check from authorizing a new location.
  const deliveryCheckKey = `${singleRestaurantId}|${addressMode}|${
    addressMode === "saved"
      ? selectedAddressId
      : `${deliveryCity.trim().toLowerCase()}|${deliveryArea.trim().toLowerCase()}`
  }`;

  const [deliveryStatus, setDeliveryStatus] = useState<{
    key: string;
    state: "checking" | "available" | "unavailable" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !loaded || !singleRestaurantId || !locationReady) return;

    const controller = new AbortController();
    const key = deliveryCheckKey;
    setDeliveryStatus({ key, state: "checking", message: "Checking delivery availability..." });

    const location = addressMode === "saved"
      ? { addressId: selectedAddressId }
      : { city: deliveryCity.trim(), area: deliveryArea.trim() };

    void checkDeliveryAvailability(singleRestaurantId, location, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setDeliveryStatus({
          key,
          state: result.available ? "available" : "unavailable",
          message: result.message,
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setDeliveryStatus({
          key,
          state: "error",
          message: err instanceof Error ? err.message : "Delivery check failed.",
        });
      });

    return () => controller.abort();
  }, [isAuthenticated, loaded, singleRestaurantId, locationReady, deliveryCheckKey,
      addressMode, selectedAddressId, deliveryCity, deliveryArea]);

  const currentDeliveryStatus =
    deliveryStatus?.key === deliveryCheckKey ? deliveryStatus : null;
  const canPlaceOrder =
    !loading && !addressesLoading && isAuthenticated &&
    Boolean(singleRestaurantId) && locationReady &&
    currentDeliveryStatus?.state === "available";

  // Submit order with structured delivery location.
  const handlePlaceOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    setError("");

    if (!canPlaceOrder) {
      setError(cartRestaurantError || currentDeliveryStatus?.message ||
        "Select a delivery location and wait for the availability check.");
      return;
    }

    if (!isAuthenticated) {
      setError("Please login before placing an order.");
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

    let finalCustomerName = customerName.trim();
    let finalPhone = phone.trim();
    let finalAddress = address.trim();

    let finalCity = deliveryCity.trim();
    let finalArea = deliveryArea.trim();

    // Saved-address checkout
    if (addressMode === "saved") {
      if (!selectedAddress) {
        setError(
          "Please select a valid saved delivery address."
        );
        return;
      }

      if (!selectedAddress.area?.trim()) {
        setError(
          "Your saved address is missing a delivery area. " +
          "Please update it or enter your address manually."
        );
        return;
      }

      finalCustomerName =
        selectedAddress.fullName.trim();

      finalPhone = selectedAddress.phone.trim();

      finalAddress =
        formatDeliveryAddress(selectedAddress);

      finalCity = selectedAddress.city.trim();
      finalArea = selectedAddress.area.trim();
    }

    // Common validation
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

    if (!finalCity) {
      setError("Please enter your delivery city.");
      return;
    }

    if (!finalArea) {
      setError("Please enter your delivery area.");
      return;
    }

    // Check that quantities are valid.
    const invalidCartItem = cart.some(
      (item) =>
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0 ||
        item.quantity > 100
    );

    if (invalidCartItem) {
      setError(
        "Please check your cart item quantities."
      );
      return;
    }

    const payload: CheckoutPayload = {
      customerName: finalCustomerName,
      phone: finalPhone,
      address: finalAddress,

      ...(addressMode === "saved"
        ? {
            addressId: selectedAddressId,
          }
        : {
            city: finalCity,
            area: finalArea,
          }),

      items: cart.map((item) => ({
        menuItemId: item._id,
        quantity: item.quantity,
      })),
    };

    setLoading(true);

    try {
      // Backend verifies restaurant delivery coverage
      // before creating the COD order.
      const order = await placeOrder(payload);

      // Only clear cart after successful order creation.
      clearCart();

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

  // Initial loading state
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

  // Login required
  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md rounded-xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900">
            Login Required
          </h1>

          <p className="mt-4 text-gray-600">
            Please login to your FoodNest account
            before placing an order.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Confirm your delivery location and
            complete your order.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout form */}
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-6 rounded-xl bg-white p-6 shadow lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Details
            </h2>

            {/* Saved/manual address selection */}
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
                          onChange={() => {
                            setAddressMode("saved");
                            setError("");
                          }}
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
                          onChange={() => {
                            setAddressMode("manual");
                            setError("");
                          }}
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
                        onSelect={(id) => {
                          setSelectedAddressId(id);
                          setError("");
                        }}
                        disabled={loading}
                      />
                    )}

                  {addressMode === "saved" &&
                    selectedAddress &&
                    !savedAddressHasArea && (
                      <div
                        role="alert"
                        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900"
                      >
                        <p className="font-semibold">
                          Delivery area missing
                        </p>

                        <p className="mt-1">
                          This saved address does not
                          have a delivery area. Please
                          update it before ordering,
                          or choose manual entry.
                        </p>

                        <Link
                          href="/profile/addresses"
                          className="mt-2 inline-block font-semibold text-orange-600 hover:underline"
                        >
                          Update Saved Address
                        </Link>
                      </div>
                    )}

                  {addressMode === "saved" &&
                    selectedAddress?.area?.trim() && (
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">
                          Selected Delivery Location
                        </p>

                        <p className="mt-1 text-sm text-gray-700">
                          📍 {selectedAddress.area},{" "}
                          {selectedAddress.city}
                        </p>

                        <p className="mt-2 text-xs text-orange-700">
                          Restaurant delivery coverage
                          will be verified before
                          your order is accepted.
                        </p>
                      </div>
                    )}

                  {savedAddresses.length === 0 &&
                    !addressesError && (
                      <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                        No saved addresses found.
                        Enter your delivery details
                        below or add a saved address.
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
                    placeholder="House number, street, landmark, state and PIN code"
                  />
                </div>

                {/* Choose delivery city and area from restaurant data */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="deliveryCity"
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Delivery City
                    </label>
                    <select
                      id="deliveryCity"
                      required
                      value={deliveryCity}
                      onChange={(event) => {
                        setDeliveryCity(event.target.value);
                        setDeliveryArea("");
                        setError("");
                      }}
                      disabled={loading || locationsLoading || Boolean(locationsError)}
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                    >
                      <option value="">
                        {locationsLoading ? "Loading cities..." : "Select your city"}
                      </option>
                      {cities.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="deliveryArea"
                      className="mb-2 block font-medium text-gray-700"
                    >
                      Delivery Area
                    </label>
                    <select
                      id="deliveryArea"
                      required
                      value={deliveryArea}
                      onChange={(event) => {
                        setDeliveryArea(event.target.value);
                        setError("");
                      }}
                      disabled={loading || locationsLoading || !deliveryCity || Boolean(locationsError)}
                      className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 focus:border-orange-500 focus:outline-none disabled:opacity-60"
                    >
                      <option value="">
                        {!deliveryCity ? "Select city first" : "Select your area"}
                      </option>
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {locationsError && (
                  <p role="alert" className="text-sm text-red-600">
                    Could not load delivery locations: {locationsError}
                  </p>
                )}
                {!locationsLoading && !locationsError && cities.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No delivery locations configured. Add city and deliveryAreas
                    to your restaurant records.
                  </p>
                )}
                {!locationsLoading && deliveryCity && areas.length === 0 && (
                  <p className="text-sm text-amber-700">
                    No delivery areas are configured for this city.
                  </p>
                )}

                <div className="rounded-lg border border-orange-100 bg-orange-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">
                    📍 Delivery Availability
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    FoodNest will verify that the
                    restaurant delivers to your
                    selected city and area before
                    accepting the order.
                  </p>
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

            {/* Checkout error */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            {/* Live delivery availability */}
            {cartRestaurantError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {cartRestaurantError}
              </p>
            )}
            {!cartRestaurantError && !locationReady && (
              <p className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                {addressMode === "saved"
                  ? "Select a saved address with a delivery area, or update your saved address."
                  : "Select your delivery city and area to check availability."}
              </p>
            )}
            {!cartRestaurantError && locationReady && currentDeliveryStatus && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-lg p-3 text-sm ${
                  currentDeliveryStatus.state === "available"
                    ? "bg-green-50 text-green-800"
                    : currentDeliveryStatus.state === "checking"
                      ? "bg-blue-50 text-blue-800"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {currentDeliveryStatus.state === "available" ? "✓ " :
                 currentDeliveryStatus.state === "checking" ? "… " : "✕ "}
                {currentDeliveryStatus.message}
              </p>
            )}

            {/* Place order */}
            <button
              type="submit"
              disabled={!canPlaceOrder}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Checking Delivery & Placing Order..."
                : addressesLoading
                  ? "Loading Addresses..."
                  : "Place Order"}
            </button>

            <p className="text-center text-xs text-gray-500">
              Your order will only be accepted if
              the restaurant serves your delivery
              location.
            </p>
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
              The final amount is calculated using
              current menu prices on the server.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
