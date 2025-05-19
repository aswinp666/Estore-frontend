import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { createAsyncThunk } from "@reduxjs/toolkit";

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
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // Add loading state
  error: string | null;
};

const initialState: InitialState = {
  items: [],
  status: 'idle',
  error: null
};

export const fetchUserCart = createAsyncThunk(
  'cart/fetchUserCart',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://estore-backend-dyl3.onrender.com/api/auth/cart?email=${email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.cartItems;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveUserCart = createAsyncThunk(
  'cart/saveUserCart',
  async ({ email, cartItems }: { email: string; cartItems: CartItem[] }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://estore-backend-dyl3.onrender.com/api/auth/update-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, cartItems }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
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
      // Handle fetchUserCart
      .addCase(fetchUserCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      // Handle saveUserCart
      .addCase(saveUserCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(saveUserCart.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(saveUserCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  }
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;
export const selectCartStatus = (state: RootState) => state.cartReducer.status;
export const selectCartError = (state: RootState) => state.cartReducer.error;

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => {
    const itemPrice = item.discountedPrice ?? item.price;
    return total + itemPrice * item.quantity;
  }, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
} = cart.actions;
export default cart.reducer;