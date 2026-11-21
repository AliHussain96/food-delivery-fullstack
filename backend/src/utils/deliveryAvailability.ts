
interface DeliveryLocation {
  city?: string | null;
  area?: string | null;
}

interface RestaurantDeliveryLocation {
  city?: string | null;
  deliveryAreas?: string[] | null;
}

function normalizeLocation(value?: string | null): string {
  return (value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function isDeliveryAvailable(
  restaurant: RestaurantDeliveryLocation,
  address: DeliveryLocation
): boolean {
  const restaurantCity = normalizeLocation(
    restaurant.city
  );

  const customerCity = normalizeLocation(address.city);

  const customerArea = normalizeLocation(address.area);

  // Missing location data must never mean
  // delivery is automatically available.
  if (
    !restaurantCity ||
    !customerCity ||
    !customerArea
  ) {
    return false;
  }

  if (restaurantCity !== customerCity) {
    return false;
  }

  const deliveryAreas = restaurant.deliveryAreas ?? [];

  return deliveryAreas.some(
    (area) =>
      normalizeLocation(area) === customerArea
  );
}
