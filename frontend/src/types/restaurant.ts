
export interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  totalReviews?: number;
  deliveryTime: string;
  image: string;
  description: string;

  // Step 25: Location fields
  city?: string;
  area?: string;
  deliveryAreas?: string[];

  createdAt?: string;
  updatedAt?: string;
}