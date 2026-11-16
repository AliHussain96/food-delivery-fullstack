
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="flex min-h-[400px] flex-col items-center justify-center bg-orange-50 px-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900 md:text-6xl">
        Delicious Food,
        <span className="text-orange-500"> Delivered Fast!</span>
      </h1>

      <p className="mt-5 max-w-xl text-lg text-gray-600">
        Discover delicious meals from your favorite restaurants.
        Fresh food delivered to your doorstep.
      </p>

      <Link
        href="/restaurants"
        className="mt-8 rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white hover:bg-orange-600"
      >
        Explore Restaurants
      </Link>
    </section>
  );
}
