
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { placeOrder } from "@/services/orderService";
import { getCurrentUser } from "@/services/authService";

export default function CheckoutPage() {
  const router = useRouter();

  // Cart context
  const { cart, totalItems, totalPrice, clearCart, loaded } = useCart();

  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Order states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Authentication states
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check whether the customer is logged in
  useEffect(() => {
    let active = true;

    async function checkAuthentication() {
      try {
        const user = await getCurrentUser();

        if (!active) return;

        if (!user) {
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (err) {
        console.error("Authentication check failed:", err);

        if (active) {
          setError(
            "Unable to verify your login. Please try again."
          );
        }
      } finally {
        if (active) {
          setAuthChecking(false);
        }
      }
    }

    checkAuthentication();

    return () => {
      active = false;
    };
  }, [router]);

  // Handle order submission
  const handlePlaceOrder = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    // Prevent unauthenticated checkout
    if (!isAuthenticated) {
      setError("Please login before placing an order.");
      return;
    }

    // Validate cart
    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    // Validate customer details
    if (
      !customerName.trim() ||
      !/^[0-9]{10}$/.test(phone) ||
      !address.trim()
    ) {
      setError(
        "Please enter a valid name, 10-digit phone number and address."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create order in MongoDB
      const order = await placeOrder({
        customerName: customerName.trim(),
        phone,
        address: address.trim(),
        items: cart.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      });

      // Clear cart after successful order
      clearCart();

      // Redirect to success page
      router.push(
        `/order-success?orderId=${encodeURIComponent(order._id)}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  // Wait until authentication and cart data are loaded
  if (authChecking || !loaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />

          <p className="text-lg font-medium text-gray-700">
            Checking authentication...
          </p>
        </div>
      </main>
    );
  }

  // Display login message if customer is not authenticated
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
            <p className="mt-4 text-sm text-red-600">
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
            className="mt-6 inline-block rounded-lg bg-orange-500 px-6 py-3 text-white hover:bg-orange-600"
          >
            Explore Restaurants
          </Link>
        </div>
      </main>
    );
  }

  // Checkout page
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Checkout
        </h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Delivery details */}
          <form
            onSubmit={handlePlaceOrder}
            className="space-y-6 rounded-xl bg-white p-6 shadow lg:col-span-2"
          >
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Details
            </h2>

            {/* Full Name */}
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
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="Enter your full name"
              />
            </div>

            {/* Mobile Number */}
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
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="10-digit mobile number"
              />
            </div>

            {/* Delivery Address */}
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
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                placeholder="House number, street, area, city and PIN code"
              />
            </div>

            {/* Payment Method */}
            <div>
              <h3 className="mb-3 font-semibold text-gray-900">
                Payment Method
              </h3>

              <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 text-gray-900">
                Cash on Delivery (COD)
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-red-600"
              >
                {error}
              </p>
            )}

            {/* Place Order Button */}
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </form>

          {/* Order Summary */}
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
