
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getRestaurantById } from "@/services/restaurantService";
import { getRestaurantMenu } from "@/services/menuService";

import MenuItemCard from "@/components/MenuItemCard";
import RestaurantReviews from "@/components/RestaurantReviews";
import RecommendedRestaurants from "@/components/RecommendedRestaurants";
import FavoriteButton from "@/components/FavoriteButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function RestaurantDetails({
  params,
}: PageProps) {
  const { id } = await params;

  // Fetch restaurant from MongoDB
  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  // Fetch restaurant menu
  const menuItems = await getRestaurantMenu(id);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Restaurant details */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Restaurant image */}
        <div className="relative">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-80 w-full object-cover"
          />

          {/* Favorite button */}
          <div className="absolute right-5 top-5">
            <FavoriteButton restaurantId={id} />
          </div>
        </div>

        {/* Restaurant information */}
        <div className="p-8">
          <h1 className="text-4xl font-bold text-gray-900">
            {restaurant.name}
          </h1>

          <p className="mt-3 text-lg text-gray-600">
            {restaurant.cuisine}
          </p>

          <p className="mt-5 text-gray-700">
            {restaurant.description}
          </p>

          {/* Rating and delivery time */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-green-100 px-4 py-2 font-semibold text-green-700">
                ⭐ {restaurant.rating ?? 0}
              </span>

              <span className="text-sm text-gray-500">
                ({restaurant.totalReviews ?? 0} reviews)
              </span>
            </div>

            <span className="rounded-lg bg-orange-100 px-4 py-2 font-semibold text-orange-700">
              {restaurant.deliveryTime}
            </span>

            <a
              href="#reviews"
              className="rounded-lg bg-yellow-100 px-4 py-2 font-semibold text-yellow-800 transition hover:bg-yellow-200"
            >
              ⭐ Customer Reviews
            </a>

            <a
              href="#recommendations"
              className="rounded-lg bg-orange-100 px-4 py-2 font-semibold text-orange-700 transition hover:bg-orange-200"
            >
              ✨ Similar Restaurants
            </a>
          </div>
        </div>
      </div>

      {/* Restaurant menu */}
      <section className="mt-12">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Restaurant Menu
        </h2>

        {menuItems.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">
              No menu items available for this restaurant yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {menuItems.map((item) => (
              <MenuItemCard
                key={item._id}
                item={item}
              />
            ))}
          </div>
        )}
      </section>

      {/* Customer reviews */}
      <RestaurantReviews restaurantId={id} />

      {/* Personalized recommendations */}
      <RecommendedRestaurants restaurantId={id} />
    </div>
  );
}

export default function RestaurantDetailsPage(
  props: PageProps
) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-xl font-semibold text-gray-600">
              Loading restaurant and menu...
            </p>
          </div>
        }
      >
        <RestaurantDetails params={props.params} />
      </Suspense>
    </main>
  );
}
