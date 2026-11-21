
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface DeliveryLocation {
  city: string;
  area: string;
}

interface LocationContextType {
  location: DeliveryLocation | null;
  setLocation: (location: DeliveryLocation) => void;
  clearLocation: () => void;
  locationLoaded: boolean;
}

const STORAGE_KEY = "foodnest_delivery_location";

const LocationContext = createContext<
  LocationContextType | undefined
>(undefined);

export function LocationProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [location, setLocationState] =
    useState<DeliveryLocation | null>(null);

  const [locationLoaded, setLocationLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "city" in parsed &&
          "area" in parsed &&
          typeof parsed.city === "string" &&
          typeof parsed.area === "string" &&
          parsed.city.trim() &&
          parsed.area.trim()
        ) {
          setLocationState({
            city: parsed.city.trim(),
            area: parsed.area.trim(),
          });
        }
      }
    } catch (error) {
      console.error(
        "Failed to load delivery location:",
        error
      );
    } finally {
      setLocationLoaded(true);
    }
  }, []);

  function setLocation(newLocation: DeliveryLocation) {
    const normalized = {
      city: newLocation.city.trim(),
      area: newLocation.area.trim(),
    };

    if (!normalized.city || !normalized.area) {
      return;
    }

    setLocationState(normalized);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(normalized)
    );
  }

  function clearLocation() {
    setLocationState(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        setLocation,
        clearLocation,
        locationLoaded,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);

  if (!context) {
    throw new Error(
      "useLocation must be used inside LocationProvider"
    );
  }

  return context;
}
