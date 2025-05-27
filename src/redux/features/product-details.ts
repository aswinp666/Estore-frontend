// src/redux/features/product-details.ts
import { createSlice } from "@reduxjs/toolkit";
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

export const productDetails = createSlice({
  name: "productDetails",
  initialState,
  reducers: {
    updateproductDetails: (_, action) => {
      return {
        value: {
          ...action.payload,
        },
      };
    },
  },
});

export const { updateproductDetails } = productDetails.actions;
export default productDetails.reducer;