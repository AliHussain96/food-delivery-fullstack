
"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthNav from "./AuthNav";

const navLinks = [
  { name: "Home", href: "/", icon: "⌂" },
  { name: "Restaurants", href: "/restaurants", icon: "🍽️" },
  { name: "Favorites", href: "/favorites", icon: "♥" },
  { name: "Cart", href: "/cart", icon: "🛒" },
  { name: "Orders", href: "/orders", icon: "📦" },
];

function NavigationLinks({
  pathname,
  mobile = false,
  onNavigate,
}: {
  pathname: string | null;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname?.startsWith(`${href}/`)
    );
  };

  return (
    <>
      {navLinks.map((link) => {
        const active = isActive(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? "bg-orange-50 text-orange-600"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
            } ${
              mobile ? "w-full py-3" : ""
            }`}
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">
              {link.icon}
            </span>

            <span>{link.name}</span>

            {!mobile && (
              <span
                className={`absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-orange-500 transition-transform duration-200 ${
                  active
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            )}
          </Link>
        );
      })}
    </>
  );
}

// usePathname is isolated inside Suspense.
function PathnameNavigation({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <NavigationLinks
      pathname={pathname}
      mobile={mobile}
      onNavigate={onNavigate}
    />
  );
}

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
        {/* FoodNest logo */}
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="flex shrink-0 items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl text-white shadow-sm">
            🍴
          </span>

          <span className="text-2xl font-extrabold tracking-tight text-orange-600">
            Food
            <span className="text-gray-900">
              Nest
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 lg:flex">
          <Suspense
            fallback={
              <NavigationLinks pathname={null} />
            }
          >
            <PathnameNavigation />
          </Suspense>
        </div>

        {/* Authentication and mobile toggle */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <AuthNav />
          </div>

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen((previous) => !previous)
            }
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600 transition hover:bg-orange-100 lg:hidden"
          >
            <span className="text-2xl">
              {mobileMenuOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-orange-100 bg-white px-5 pb-5 pt-3 shadow-lg lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            <Suspense
              fallback={
                <NavigationLinks
                  pathname={null}
                  mobile
                  onNavigate={() =>
                    setMobileMenuOpen(false)
                  }
                />
              }
            >
              <PathnameNavigation
                mobile
                onNavigate={() =>
                  setMobileMenuOpen(false)
                }
              />
            </Suspense>

            <div className="mt-4 border-t border-gray-100 pt-4">
              <AuthNav />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
