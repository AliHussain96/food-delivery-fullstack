import { restaurants } from "@/lib/restaurants";
import { notFound } from "next/navigation";
import { Suspense } from "react";

// Generate static restaurant routes
export function generateStaticParams() {
  return restaurants.map((restaurant) => ({
    id: restaurant.id,
  }));
}

// Define params type
interface PageProps {
  params: Promise<{ id: string }>;
}

// Restaurant details component
async function RestaurantContent({ params }: PageProps) {
  const { id } = await params;

  const restaurant = restaurants.find(
    (item) => item.id === id
  );

  if (!restaurant) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <img
        src={restaurant.image}
        alt={restaurant.name}
        className="h-80 w-full rounded-xl object-cover"
      />

      <h1 className="mt-6 text-4xl font-bold">
        {restaurant.name}
      </h1>

      <p className="mt-3 text-gray-600">
        {restaurant.description}
      </p>

      <p className="mt-4 text-gray-700">
        ⭐ {restaurant.rating} • {restaurant.deliveryTime}
      </p>
    </main>
  );
}

// Default export must be a React component
export default function RestaurantDetailsPage({
  params,
}: PageProps) {
  return (
    <Suspense fallback={<p className="p-10">Loading restaurant...</p>}>
      <RestaurantContent params={params} />
    </Suspense>
  );
}
