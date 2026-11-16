
import Link from "next/link";
import { Restaurant } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({
  restaurant,
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`}>
      <div className="overflow-hidden rounded-xl bg-white shadow-md transition hover:shadow-xl">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-48 w-full object-cover"
        />

        <div className="p-5">
          <h2 className="text-xl font-bold">
            {restaurant.name}
          </h2>

          <p className="mt-2 text-gray-500">
            {restaurant.cuisine}
          </p>

          <div className="mt-4 flex justify-between">
            <span className="text-green-600">
              ⭐ {restaurant.rating}
            </span>

            <span className="text-gray-600">
              {restaurant.deliveryTime}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
