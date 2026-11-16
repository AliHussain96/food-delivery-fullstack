
interface FoodCardProps {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function FoodCard({
  name,
  price,
  image,
  category,
}: FoodCardProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-md">
      <img
        src={image}
        alt={name}
        className="h-48 w-full object-cover"
      />

      <div className="p-5">
        <p className="text-sm text-gray-500">{category}</p>

        <h3 className="mt-2 text-xl font-semibold text-gray-900">
          {name}
        </h3>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-orange-600">
            ₹{price}
          </span>

          <button className="rounded-lg bg-orange-500 px-4 py-2 text-white">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
