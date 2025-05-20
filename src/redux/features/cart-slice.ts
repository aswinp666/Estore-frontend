import { createSelector, createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Define cart item type
type CartItem = {
  _id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
};

// Load cart from localStorage
const loadCartFromLocalStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const serializedCart = localStorage.getItem("cart");
    if (!serializedCart) return [];
    return JSON.parse(serializedCart);
  } catch {
    return [];
  }
};

// Define initial state structure
type InitialState = {
  items: CartItem[];
};

const initialState: InitialState = {
  items: loadCartFromLocalStorage(),
};

// ✅ Thunk to fetch cart from backend using localStorage user
export const fetchUserCart = createAsyncThunk(
  "cart/fetchUserCart",
  async (_, thunkAPI) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!user?.email) {
        return thunkAPI.rejectWithValue("No user email found");
      }

      const res = await fetch(`https://estore-backend-dyl3.onrender.com/api/cart?email=${user.email}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      return data.cartItems;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch cart");
    }
  }
);

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { _id, name, price, quantity, discountedPrice, imageUrl } = action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id,
          name,
          price,
          quantity,
          discountedPrice: discountedPrice || price,
          imageUrl,
        });
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number; quantity: number }>
    ) => {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item._id === id);

      if (existingItem) {
        existingItem.quantity = quantity;
      }
      localStorage.setItem("cart", JSON.stringify(state.items));
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      localStorage.removeItem("cart");
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchUserCart.fulfilled, (state, action) => {
      state.items = action.payload;
      localStorage.setItem("cart", JSON.stringify(state.items));
    });

    builder.addCase(fetchUserCart.rejected, (state, action) => {
      console.error("Error loading cart:", action.payload);
    });
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const itemPrice = item.discountedPrice ?? item.price;
    return total + itemPrice * item.quantity;
  }, 0);
});

// Export actions and reducer
export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;

export default cart.reducer;
