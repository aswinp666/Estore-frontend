export type Product = {
  _id: string;  // <-- change here
  name: string;
  reviews: number;
  price: number;
  discountedPrice: number;
  category: string;
  imageUrl: string;
  options?: {
    Color?: string[];
    RAM?: string[];
  };
};
