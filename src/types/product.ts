export type Product = {
  _id: string;
  name: string;
  // Remove 'reviews: number;'
  price: number;
  discountedPrice?: number; // Make it optional if it's not always present
  description?: string; // Optional description field
  category: string;
  imageUrl: string;
  options?: {
    Color?: string[];
    RAM?: string[];
    // Add other options as needed
  };
  // Add the new fields from your Mongoose Product model
  averageRating?: number; // Now optional, as some products might not have ratings yet
  numOfReviews?: number; // Now optional
};