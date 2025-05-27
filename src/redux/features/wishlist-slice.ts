import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type WishListItem = {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number; // <--- CHANGE THIS: Add '?' to make it optional
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  // If your Product type has 'options', 'category', 'imageUrl',
  // you might also want to add them here if they are relevant for a WishListItem
  // options?: { [key: string]: string[] }; // Example if you want options in wishlist
  // category?: string; // Example
  imageUrl?: string; // Add this if it's missing and needed from Product
};

type InitialState = {
  items: WishListItem[];
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { _id, name, price, quantity, imgs, discountedPrice, status, imageUrl } = // Added imageUrl here
        action.payload;
      const existingItem = state.items.find((item) => item._id === _id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          _id,
          name,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
          imageUrl, // Make sure to include imageUrl when pushing
        });
      }
    },
    removeItemFromWishlist: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item._id !== itemId);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
} = wishlist.actions;

export default wishlist.reducer;