import { configureStore } from "@reduxjs/toolkit";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";
import authReducer from "./features/auth-slice";

import { TypedUseSelectorHook, useSelector } from "react-redux";

// Function to save cart items to localStorage
const saveCartToLocalStorage = (state: RootState) => {
  try {
    const serializedCart = JSON.stringify(state.cartReducer.items);
    localStorage.setItem("cart", serializedCart);
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
};

// Load cart from localStorage for preloaded state
const loadCartFromLocalStorage = () => {
  try {
    const serializedCart = localStorage.getItem("cart");
    if (!serializedCart) return undefined;
    return { cartReducer: { items: JSON.parse(serializedCart) } };
  } catch {
    return undefined;
  }
};

const preloadedState = loadCartFromLocalStorage();

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
    authReducer,
  },
  preloadedState,
});

// Subscribe to store changes and persist cart
store.subscribe(() => {
  saveCartToLocalStorage(store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
