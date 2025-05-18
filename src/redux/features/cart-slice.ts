import { createSelector, createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

type CartItem = {
  _id: number;
  name: string;
  price: number;
  discountedPrice?: number;
  quantity: number;
  imageUrl?: string;
};

type InitialState = {
  items: CartItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: InitialState = {
  items: [],
  status: "idle",
  error: null,
};

// Async thunk to fetch persisted cart from the backend using the user's email
export const fetchPersistedCart = createAsyncThunk<
  CartItem[], // Returned type
  string,     // Argument type (user's email)
  { rejectValue: string }
>(
  'cart/fetchPersistedCart',
  async (userEmail: string, thunkAPI) => {
    try {
      const response = await fetch(`https://estore-backend-dyl3.onrender.com/api/cart?email=${userEmail}`);
      if (!response.ok) {
        return thunkAPI.rejectWithValue("Failed to fetch cart");
      }
      const data = await response.json();
      // Assumes your backend responds with { cart: [...] }
      return data.cart as CartItem[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
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
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
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
    },
    removeAllItemsFromCart: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPersistedCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPersistedCart.fulfilled, (state, action: PayloadAction<CartItem[]>) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchPersistedCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch cart";
      });
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalPrice = createSelector(
  [selectCartItems],
  (items) => {
    return items.reduce((total, item) => {
      const itemPrice = item.discountedPrice ?? item.price;
      return total + itemPrice * item.quantity;
    }, 0);
  }
);

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;
