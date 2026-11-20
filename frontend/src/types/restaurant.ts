
export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  totalReviews?: number;
  deliveryTime: string;
  image: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}
