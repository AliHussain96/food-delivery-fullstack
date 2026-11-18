
"use client";

import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/types/menu";

interface FoodCardProps {
  item: MenuItem;
}

export default function FoodCard({ item }: FoodCardProps) {
  const { cart, addToCart } = useCart();

  const existingItem = cart.find(
    (food) => food._id === item._id
  );

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <img
        src={item.image}
        alt={item.name}
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900">
          {item.name}
        </h3>

        <p className="mt-2 text-gray-600">
          {item.description}
        </p>

        <p className="mt-3 text-lg font-semibold text-orange-600">
          ₹{item.price}
        </p>

        <button
          type="button"
          onClick={() => addToCart(item)}
          disabled={!item.isAvailable}
          className="mt-4 w-full rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600 disabled:bg-gray-400"
        >
          {!item.isAvailable
            ? "Unavailable"
            : existingItem
            ? `Add More (${existingItem.quantity} in cart)`
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
