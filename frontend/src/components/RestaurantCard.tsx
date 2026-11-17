
import Link from "next/link";
import type { Restaurant } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({
  restaurant,
}: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurants/${restaurant._id}`}
      className="block overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
    >
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <h2 className="text-xl font-bold text-gray-900">
          {restaurant.name}
        </h2>

        <p className="mt-1 text-gray-600">
          {restaurant.cuisine}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="rounded bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
            ⭐ {restaurant.rating}
          </span>

          <span className="text-sm text-gray-600">
            {restaurant.deliveryTime}
          </span>
        </div>
      </div>
    </Link>
  );
}
