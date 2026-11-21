
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import { useLocation } from "@/context/LocationContext";
import { getRestaurants } from "@/services/restaurantService";
import type { Restaurant } from "@/types/restaurant";

export default function LocationSelector() {
  const {
    location,
    setLocation,
    clearLocation,
    locationLoaded,
  } = useLocation();

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  const [restaurants, setRestaurants] = useState<
    Restaurant[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch supported restaurant locations when opened
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadRestaurants() {
      setLoading(true);
      setError("");

      try {
        const data = await getRestaurants();

        if (!cancelled) {
          setRestaurants(data);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load delivery locations.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadRestaurants();

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Initialize form using saved location
  useEffect(() => {
    if (!open) return;

    setCity(location?.city ?? "");
    setArea(location?.area ?? "");
  }, [open, location]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

  const cities = useMemo(() => {
    return Array.from(
      new Set(
        restaurants
          .map((restaurant) => restaurant.city?.trim())
          .filter((value): value is string => Boolean(value))
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  const areas = useMemo(() => {
    if (!city) return [];

    return Array.from(
      new Set(
        restaurants
          .filter(
            (restaurant) =>
              restaurant.city?.trim().toLowerCase() ===
              city.trim().toLowerCase()
          )
          .flatMap(
            (restaurant) => restaurant.deliveryAreas ?? []
          )
          .map((value) => value.trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [restaurants, city]);

  function handleCityChange(newCity: string) {
    setCity(newCity);
    setArea("");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCity = city.trim();
    const trimmedArea = area.trim();

    if (!trimmedCity || !trimmedArea) return;

    const cityExists = cities.some(
      (item) =>
        item.toLowerCase() === trimmedCity.toLowerCase()
    );

    const areaExists = areas.some(
      (item) =>
        item.toLowerCase() === trimmedArea.toLowerCase()
    );

    if (!cityExists || !areaExists) {
      setError("Please select a supported city and area.");
      return;
    }

    setLocation({
      city: trimmedCity,
      area: trimmedArea,
    });

    setOpen(false);
  }

  function handleClear() {
    clearLocation();
    setCity("");
    setArea("");
    setOpen(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative shrink-0"
    >
      {/* Compact navbar button */}
      <button
        type="button"
        onClick={() =>
          setOpen((previous) => !previous)
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={!locationLoaded}
        className="flex w-[105px] shrink-0 items-center gap-1 rounded-lg border border-orange-100 bg-orange-50 px-2 py-1.5 text-left transition hover:bg-orange-100 disabled:opacity-60 sm:w-[120px]"
      >
        <span className="shrink-0 text-sm">
          📍
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-semibold uppercase leading-3 text-gray-500">
            Deliver to
          </span>

          <span
            className="block truncate text-[10px] font-bold leading-4 text-gray-900"
            title={
              location
                ? `${location.area}, ${location.city}`
                : "Select location"
            }
          >
            {!locationLoaded
              ? "Loading..."
              : location
                ? `${location.area}, ${location.city}`
                : "Select location"}
          </span>
        </span>

        <span className="shrink-0 text-[10px] text-orange-600">
          ▾
        </span>
      </button>

      {/* Location popup */}
      {open && (
        <div
          role="dialog"
          aria-label="Select delivery location"
          className="absolute right-0 top-full z-[70] mt-2 w-[min(90vw,280px)] rounded-xl border border-orange-100 bg-white p-3 text-gray-900 shadow-xl"
        >
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-900">
              📍 Select delivery location
            </h3>

            <p className="mt-1 text-[11px] leading-4 text-gray-500">
              Choose a supported city and delivery area.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-600"
            >
              {error}
            </p>
          )}

          <form
            onSubmit={handleSave}
            className="space-y-3"
          >
            {/* City dropdown */}
            <div>
              <label
                htmlFor="delivery-city"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                City
              </label>

              <select
                id="delivery-city"
                value={city}
                onChange={(event) =>
                  handleCityChange(event.target.value)
                }
                disabled={loading || Boolean(error)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                style={{
                  color: "#111827",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">
                  {loading
                    ? "Loading cities..."
                    : "Select city"}
                </option>

                {cities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Area dropdown */}
            <div>
              <label
                htmlFor="delivery-area"
                className="mb-1 block text-xs font-semibold text-gray-700"
              >
                Delivery Area
              </label>

              <select
                id="delivery-area"
                value={area}
                onChange={(event) =>
                  setArea(event.target.value)
                }
                disabled={
                  loading ||
                  Boolean(error) ||
                  !city ||
                  areas.length === 0
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                style={{
                  color: "#111827",
                  backgroundColor: "#ffffff",
                }}
              >
                <option value="">
                  Select delivery area
                </option>

                {areas.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                Boolean(error) ||
                !city ||
                !area
              }
              className="w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save location
            </button>
          </form>

          {location && (
            <button
              type="button"
              onClick={handleClear}
              className="mt-2 w-full text-center text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear saved location
            </button>
          )}
        </div>
      )}
    </div>
  );
}
