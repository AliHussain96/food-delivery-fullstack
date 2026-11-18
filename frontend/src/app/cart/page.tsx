
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-900">
              Your cart is empty
            </h2>

            <Link
              href="/restaurants"
              className="mt-5 inline-block rounded-lg bg-orange-500 px-6 py-3 text-white"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {cart.map((item) => (
                <div
                  key={item._id}
                  className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow sm:flex-row"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-28 rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {item.name}
                    </h2>

                    <p className="mt-1 text-gray-600">
                      ₹{item.price} each
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => decreaseQuantity(item._id)}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-lg text-gray-900 hover:bg-gray-300"
                      >
                        −
                      </button>

                      <span className="font-bold text-gray-900">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => increaseQuantity(item._id)}
                        className="rounded-lg bg-gray-200 px-4 py-2 text-lg text-gray-900 hover:bg-gray-300"
                      >
                        +
                      </button>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="ml-auto text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="mt-3 font-semibold text-gray-900">
                      Subtotal: ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit rounded-xl bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mb-3 flex justify-between text-gray-700">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>

              <div className="mb-6 flex justify-between text-lg font-bold text-gray-900">
                <span>Total Price</span>
                <span>₹{totalPrice}</span>
              </div>

              <Link
                href="/checkout"
                className="block rounded-lg bg-orange-500 px-5 py-3 text-center font-semibold text-white hover:bg-orange-600"
              >
                Proceed to Checkout
              </Link>

              <button
                type="button"
                onClick={clearCart}
                className="mt-3 w-full rounded-lg border border-red-500 px-5 py-3 text-red-600 hover:bg-red-50"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
