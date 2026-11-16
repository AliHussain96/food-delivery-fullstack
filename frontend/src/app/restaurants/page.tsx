
import RestaurantCard from "@/components/RestaurantCard";
import { restaurants } from "@/lib/restaurants";

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">
          Explore Restaurants
        </h1>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
