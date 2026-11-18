
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";

// Cart item structure
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  restaurantId?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  loaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, authLoading } = useAuth();

  const storageKey = authLoading
    ? null
    : user
      ? `foodnest_cart_${user._id}`
      : "foodnest_guest_cart";

  // Each storage key gets its own cart state.
  // This avoids briefly exposing the previous user's cart.
  const [cartState, setCartState] = useState<{
    key: string;
    items: CartItem[];
  } | null>(null);

  const loaded =
    storageKey !== null && cartState?.key === storageKey;

  const cart = loaded ? cartState!.items : [];

  // Load the correct cart when the authenticated user changes
  useEffect(() => {
    if (!storageKey) return;

    try {
      const savedCart = localStorage.getItem(storageKey);

      const parsed: unknown = savedCart
        ? JSON.parse(savedCart)
        : [];

      const items: CartItem[] = Array.isArray(parsed)
        ? parsed.filter(
            (item): item is CartItem =>
              typeof item === "object" &&
              item !== null &&
              typeof item._id === "string" &&
              typeof item.name === "string" &&
              typeof item.price === "number" &&
              typeof item.quantity === "number" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0
          )
        : [];

      setCartState({
        key: storageKey,
        items,
      });
    } catch (error) {
      console.error("Failed to load cart:", error);

      setCartState({
        key: storageKey,
        items: [],
      });
    }
  }, [storageKey]);

  // Save only the cart belonging to the current storage key
  useEffect(() => {
    if (!storageKey || !loaded || !cartState) return;

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(cartState.items)
      );
    } catch (error) {
      console.error("Failed to save cart:", error);
    }
  }, [storageKey, loaded, cartState]);

  const updateCart = useCallback(
    (updater: (current: CartItem[]) => CartItem[]) => {
      if (!storageKey) return;

      setCartState((previous) => {
        if (!previous || previous.key !== storageKey) {
          return previous;
        }

        return {
          key: storageKey,
          items: updater(previous.items),
        };
      });
    },
    [storageKey]
  );

  // Add item to cart
  const addToCart = useCallback(
    (item: Omit<CartItem, "quantity">) => {
      updateCart((current) => {
        const existing = current.find(
          (cartItem) => cartItem._id === item._id
        );

        if (existing) {
          return current.map((cartItem) =>
            cartItem._id === item._id
              ? {
                  ...cartItem,
                  quantity: cartItem.quantity + 1,
                }
              : cartItem
          );
        }

        return [
          ...current,
          {
            ...item,
            quantity: 1,
          },
        ];
      });
    },
    [updateCart]
  );

  // Remove item completely
  const removeFromCart = useCallback(
    (id: string) => {
      updateCart((current) =>
        current.filter((item) => item._id !== id)
      );
    },
    [updateCart]
  );

  // Increase item quantity
  const increaseQuantity = useCallback(
    (id: string) => {
      updateCart((current) =>
        current.map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    },
    [updateCart]
  );

  // Decrease item quantity
  const decreaseQuantity = useCallback(
    (id: string) => {
      updateCart((current) =>
        current
          .map((item) =>
            item._id === id
              ? {
                  ...item,
                  quantity: item.quantity - 1,
                }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    [updateCart]
  );

  // Clear only the current user's cart
  const clearCart = useCallback(() => {
    updateCart(() => []);
  }, [updateCart]);

  const totalItems = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cart]
  );

  const totalPrice = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to access cart
export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
