
"use client";

import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: MenuItem;
}

export default function MenuItemCard({
  item,
}: MenuItemCardProps) {
  // Access cart functions and data
  const { addToCart, cart } = useCart();

  // Check if the food item already exists in the cart
  const cartItem = cart.find(
    (cartItem) => cartItem._id === item._id
  );

  return (
    <div className="flex gap-4 rounded-xl bg-white p-4 shadow-md">

      {/* Food Image */}
      <img
        src={item.image}
        alt={item.name}
        className="h-28 w-28 rounded-lg object-cover"
      />

      {/* Food Details */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900">
          {item.name}
        </h3>

        <p className="mt-1 text-sm text-gray-600">
          {item.description}
        </p>

        <p className="mt-2 text-lg font-semibold text-green-700">
          ₹{item.price}
        </p>

        {/* Add to Cart Button */}
        <button
          onClick={() => addToCart(item)}
          disabled={!item.isAvailable}
          className="mt-3 rounded-lg bg-orange-500 px-4 py-2 font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {!item.isAvailable
            ? "Unavailable"
            : cartItem
              ? `Add More (${cartItem.quantity} in cart)`
              : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
