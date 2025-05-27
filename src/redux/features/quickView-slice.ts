// src/redux/features/quickView-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/product";

type InitialState = {
  value: Product;
};

const initialState: InitialState = {
  value: {
    name: "",
    // REMOVE 'reviews: 0,'
    averageRating: 0, // Add this
    numOfReviews: 0,  // Add this
    price: 0,
    discountedPrice: 0, // Ensure this is present if in Product type, otherwise remove
    _id: "0",
    category: "",
    imageUrl: "",
    description: "", // Add default for description if required by Product type
    options: {},     // Add default for options if required by Product type
  },
};

export const quickView = createSlice({
  name: "quickView",
  initialState,
  reducers: {
    updateQuickView: (_, action: PayloadAction<Product>) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },

    resetQuickView: (state) => { // Changed from `()` to `(state)` for clarity, though `_` works
      return {
        value: initialState.value,
      };
    },
  },
});

export const { updateQuickView, resetQuickView } = quickView.actions;
export default quickView.reducer;