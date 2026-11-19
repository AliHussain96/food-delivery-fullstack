
import { Suspense } from "react";
import RestaurantFilters from "@/components/RestaurantFilters";
import { getRestaurants } from "@/services/restaurantService";

async function RestaurantList() {
  const restaurants = await getRestaurants();

  return <RestaurantFilters restaurants={restaurants} />;
}

export default function RestaurantsPage() {
  return (
    <main className="min-h-screen bg-[#fffaf7]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-[#fff1e8] to-orange-100 px-6 py-16 md:py-20">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm">
            🍴 Discover great food
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 md:text-6xl">
            Explore{" "}
            <span className="text-orange-600">
              Restaurants
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
            Discover delicious dishes, explore new cuisines,
            and order from your favorite restaurants.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "⚡ Fast Delivery",
              "⭐ Top Rated",
              "🍕 Delicious Food",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white bg-white/80 px-5 py-3 text-sm font-medium text-gray-800 shadow-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurant listing */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <Suspense
          fallback={
            <div className="space-y-8">
              <div className="h-24 animate-pulse rounded-3xl bg-orange-100" />
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-96 animate-pulse rounded-3xl bg-orange-100"
                  />
                ))}
              </div>
            </div>
          }
        >
          <RestaurantList />
        </Suspense>
      </section>
    </main>
  );
}
