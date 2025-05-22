export type Product = {
  _id: number;
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
