
export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  image: string;
  description: string;
}

export type RestaurantInput = Omit<Restaurant, "_id">;

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
}

export type MenuItemInput = Omit<
  MenuItem,
  "_id" | "restaurantId"
>;
