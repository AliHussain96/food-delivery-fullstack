
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRestaurantById } from "@/services/restaurantService";
import { getRestaurantMenu } from "@/services/menuService";
import MenuItemCard from "@/components/MenuItemCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Fetch restaurant details and menu
async function RestaurantDetails({ params }: PageProps) {
  const { id } = await params;

  // Fetch restaurant from MongoDB
  const restaurant = await getRestaurantById(id);

  // Handle invalid restaurant ID
  if (!restaurant) {
    notFound();
  }

  // Fetch menu items from MongoDB
  const menuItems = await getRestaurantMenu(id);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Restaurant Details */}
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        {/* Restaurant Image */}
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-80 w-full object-cover"
        />

        {/* Restaurant Information */}
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

          {/* Rating and Delivery Time */}
          <div className="mt-6 flex flex-wrap gap-4">
            <span className="rounded-lg bg-green-100 px-4 py-2 font-semibold text-green-700">
              ⭐ {restaurant.rating}
            </span>

            <span className="rounded-lg bg-orange-100 px-4 py-2 font-semibold text-orange-700">
              {restaurant.deliveryTime}
            </span>
          </div>
        </div>
      </div>

      {/* Restaurant Menu Section */}
      <section className="mt-12">
        <h2 className="mb-6 text-3xl font-bold text-gray-900">
          Restaurant Menu
        </h2>

        {/* Check whether menu items exist */}
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
    </div>
  );
}

// Main Restaurant Details Page
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
