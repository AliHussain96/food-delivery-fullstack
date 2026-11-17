
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getRestaurantById } from "@/services/restaurantService";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function RestaurantDetails({
  params,
}: PageProps) {
  const { id } = await params;

  const restaurant = await getRestaurantById(id);

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl overflow-hidden rounded-xl bg-white shadow-lg">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-80 w-full object-cover"
      />

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
  );
}

export default function RestaurantDetailsPage(
  props: PageProps
) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <Suspense fallback={<p>Loading restaurant details...</p>}>
        <RestaurantDetails params={props.params} />
      </Suspense>
    </main>
  );
}
