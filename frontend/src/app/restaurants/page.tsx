
import { Suspense } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { getRestaurants } from "@/services/restaurantService";

async function RestaurantList() {
  const restaurants = await getRestaurants();

  if (restaurants.length === 0) {
    return (
      <p className="mt-10 text-center text-gray-500">
        No restaurants available yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id}
          restaurant={restaurant}
        />
      ))}
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-3 text-4xl font-bold text-gray-900">
          Explore Restaurants
        </h1>

        <p className="mb-10 text-gray-600">
          Discover delicious food from restaurants near you.
        </p>

        <Suspense
          fallback={
            <p className="text-gray-500">
              Loading restaurants...
            </p>
          }
        >
          <RestaurantList />
        </Suspense>
      </div>
    </main>
  );
}
