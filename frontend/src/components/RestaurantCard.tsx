
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
      className="group block overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
    >
      <div className="relative h-56 overflow-hidden bg-orange-50">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute left-4 top-4 rounded-full bg-green-600 px-3 py-1.5 text-sm font-bold text-white shadow">
          ★ {restaurant.rating}
        </div>

        <div className="absolute bottom-4 right-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-orange-600 shadow">
          Explore Menu
        </div>
      </div>

      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-orange-600">
          {restaurant.name}
        </h2>

        <p className="mt-1 text-sm font-medium text-orange-600">
          {restaurant.cuisine}
        </p>

        <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-gray-500">
          {restaurant.description ||
            "Discover delicious food and explore the menu."}
        </p>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <span className="text-orange-500">◷</span>
            {restaurant.deliveryTime}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xl text-white transition-all group-hover:translate-x-1 group-hover:bg-orange-600">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
