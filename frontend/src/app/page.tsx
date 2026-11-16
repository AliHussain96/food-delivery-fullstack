import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FoodCard from "@/components/FoodCard";

const foods = [
  {
    id: 1,
    name: "Margherita Pizza",
    price: 249,
    category: "Pizza",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002",
  },
  {
    id: 2,
    name: "Cheese Burger",
    price: 149,
    category: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd",
  },
  {
    id: 3,
    name: "Veg Biryani",
    price: 199,
    category: "Biryani",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <HeroSection />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="mb-8 text-3xl font-bold text-gray-900">
          Popular Dishes
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {foods.map((food) => (
            <FoodCard key={food.id} {...food} />
          ))}
        </div>
      </section>
    </main>
  );
}
