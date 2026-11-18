import Link from "next/link";
import AuthNav from "./AuthNav";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between bg-white px-6 py-4 shadow-sm">
      <Link href="/" className="text-2xl font-bold text-orange-600">
        FoodNest
      </Link>

      <div className="flex items-center gap-5 text-gray-700">
        <Link href="/">Home</Link>
        <Link href="/restaurants">Restaurants</Link>
        <Link href="/cart">Cart</Link>
        <Link
          href="/orders"
          className="font-medium text-gray-700 hover:text-orange-500"
        >
          Orders
        </Link>
        {/* <Link
          href="/login"
          className="font-medium text-gray-700 hover:text-orange-500"
        >
          Login
        </Link>

        <Link
          href="/register"
          className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white hover:bg-orange-600"
        >
          Register
        </Link> */}
        <AuthNav />
      </div>
    </nav>
  );
}
