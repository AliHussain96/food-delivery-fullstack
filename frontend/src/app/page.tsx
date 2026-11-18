
import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import FoodCard from "@/components/FoodCard";
import { getAllMenuItems } from "@/services/menuService";
import type { MenuItem } from "@/types/menu";

// Fetch menu items from MongoDB
async function PopularDishes() {
  let foods: MenuItem[] = [];
  let errorMessage = "";

  try {
    const menuItems = await getAllMenuItems();

    foods = menuItems.filter((item) => item.isAvailable);
  } catch (error) {
    console.error("Failed to load homepage menu:", error);
    errorMessage = "Unable to load food items. Please try again.";
  }

  if (errorMessage) {
    return (
      <p className="rounded-lg bg-red-50 p-4 text-red-600">
        {errorMessage}
      </p>
    );
  }

  if (foods.length === 0) {
    return (
      <p className="rounded-lg bg-white p-6 text-gray-600">
        No food items available right now.
      </p>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {foods.map((food) => (
        <FoodCard key={food._id} item={food} />
      ))}
    </div>
  );
}

// Main homepage
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <HeroSection />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">
          Popular Dishes
        </h2>

        <Suspense
          fallback={
            <div className="py-12 text-center">
              <p className="text-lg text-gray-600">
                Loading delicious food...
              </p>
            </div>
          }
        >
          <PopularDishes />
        </Suspense>
      </section>
    </main>
  );
}
