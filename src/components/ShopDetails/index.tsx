// src/app/(site)/shop-details/index.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { FaHeart, FaMinus, FaPlus } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
// import Newsletter from "src/app/(site)/Common/Newsletter"; // Ensure correct path if changed
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice"; // Assuming CartItem type is defined or inferred here
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { FaStar, FaRegStar } from 'react-icons/fa';

// Define the Review type for better type safety
type Review = {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
};

// Define the Product type, making 'images' and 'stock' optional
// as they might not always be present or fully defined from the Redux store
type Product = {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images?: { url: string }[]; // Made optional to prevent type errors
  description: string;
  category: string;
  stock?: number; // Made optional to prevent type errors
  reviews?: Review[]; // Make reviews optional as it might not always be present
};

// Assuming CartItem type from cart-slice.ts looks something like this.
// If it's different, you might need to adjust this definition or the mapping in handleAddToCart.
type CartItem = {
  productId: string;
  name: string;
  price: number;
  image?: string; // Assuming cart item might need an image URL
  quantity: number;
  discountPrice?: number; // Include discount price if applicable
};


const ShopDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();

  // Select product details from Redux store
  const productFromRedux = useAppSelector((state) => state.productDetailsReducer.value);

  // Use useMemo to get the product, prioritizing Redux data or falling back to dummy data
  const product: Product | null = useMemo(() => {
    // Prioritize product from Redux if it's a valid product (not the initial "0" ID)
    if (productFromRedux && productFromRedux._id && productFromRedux._id !== "0") {
      // Ensure that productFromRedux conforms to the 'Product' type
      // You might need a more robust type assertion or a mapping if productFromRedux has a significantly different structure
      return productFromRedux as Product;
    }
    // Fallback to a dummy product if Redux product is not available or invalid
    // This dummy data is crucial for demonstrating the reviews section when no real product is loaded.
    return {
      _id: "1",
      name: "Premium Hair Styling Kit",
      price: 250,
      discountPrice: 200,
      images: [{ url: "https://placehold.co/600x400/FF5733/FFFFFF?text=Hair+Styling+Kit" }],
      description: "Achieve salon-quality hairstyles at home with our premium hair styling kit. Includes a professional hairdryer, ceramic straightener, and a set of styling brushes.",
      category: "Hair Care",
      stock: 10,
      reviews: [
        { _id: "r1", user: { _id: "u1", name: "Alice Smith" }, rating: 5, comment: "Absolutely love this kit! My hair has never looked better. The hairdryer is super fast.", createdAt: "2023-01-15T10:00:00Z" },
        { _id: "r2", user: { _id: "u2", name: "Bob Johnson" }, rating: 4, comment: "Very good product, but the straightener takes a bit long to heat up. Otherwise, excellent!", createdAt: "2023-02-20T11:30:00Z" },
        { _id: "r3", user: { _id: "u3", name: "Charlie Brown" }, rating: 5, comment: "Highly recommend! The brushes are fantastic and the overall quality is top-notch.", createdAt: "2023-03-01T14:00:00Z" },
        { _id: "r4", user: { _id: "u4", name: "Diana Prince" }, rating: 3, comment: "It's okay. Does the job, but I've used better. The hairdryer is a bit noisy.", createdAt: "2023-04-10T09:00:00Z" },
        { _id: "r5", user: { _id: "u5", name: "Eve Adams" }, rating: 5, comment: "Best hair styling kit I've ever owned! Worth every penny. My hair feels so soft and shiny.", createdAt: "2023-05-05T16:00:00Z" },
        { _id: "r6", user: { _id: "u6", name: "Frank White" }, rating: 2, comment: "Disappointed with the quality of the straightener. It snagged my hair a few times.", createdAt: "2023-06-12T13:00:00Z" },
        { _id: "r7", user: { _id: "u7", name: "Grace Lee" }, rating: 4, comment: "Solid performance. The hairdryer is very powerful. Good value for money.", createdAt: "2023-07-01T15:00:00Z" },
        { _id: "r8", user: { _id: "u8", name: "Harry Wilson" }, rating: 5, comment: "Fantastic product! My hair looks professionally styled every day now.", createdAt: "2023-08-20T08:00:00Z" },
      ],
    };
  }, [productFromRedux]);

  // Extract reviews from the product, default to an empty array if none exist
  const reviews = product?.reviews || [];

  // Calculate average rating and star counts using useMemo for performance
  const { averageRating, totalReviews, starCounts } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      // Return default values if no reviews are present
      return { averageRating: 0, totalReviews: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }

    let sumRatings = 0;
    // Initialize counts for each star rating
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Iterate through reviews to sum ratings and count occurrences for each star
    reviews.forEach((review) => {
      sumRatings += review.rating;
      if (review.rating >= 1 && review.rating <= 5) {
        counts[review.rating as keyof typeof counts]++;
      }
    });

    // Calculate the average rating, formatted to one decimal place
    const avg = sumRatings / reviews.length;
    return {
      averageRating: parseFloat(avg.toFixed(1)),
      totalReviews: reviews.length,
      starCounts: counts,
    };
  }, [reviews]); // Recalculate only when reviews change

  // Function to handle adding item to cart
  const handleAddToCart = () => {
    if (product) {
      // Create a CartItem object to match the expected type
      const cartItem: CartItem = {
        productId: product._id, // Map _id to productId
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url, // Get the first image URL if available
        quantity: quantity,
        discountPrice: product.discountPrice,
      };
      dispatch(addItemToCart(cartItem));
      // Optionally, add a notification here
    }
  };

  // Function to handle adding item to wishlist
  // const handleAddToWishlist = () => {
  //   if (product) {
  //     dispatch(addItemToWishlist(product));
  //     // Optionally, add a notification here
  //   }
  // };

  return (
    <>
      {/* Breadcrumb component for navigation */}
      {/* Updated props to match what the Breadcrumb component expects */}
      <Breadcrumb title="Shop Details" pages={[{ name: "Home", path: "/" }, { name: "Shop Details", path: "/shop-details" }]} />

      {/* Product Details Section */}
      <section className="pb-[90px] pt-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center justify-between">
            {/* Product Image Column */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="relative mb-12 flex h-[350px] items-center justify-center rounded-md bg-gray-100 xl:h-[450px]">
                {product?.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0].url}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain"
                    onError={(e) => {
                      // Fallback to a placeholder image if the original image fails to load
                      e.currentTarget.src = "https://placehold.co/400x400/CCCCCC/333333?text=Image+Error";
                    }}
                  />
                ) : (
                  <Image
                    src="https://placehold.co/400x400/CCCCCC/333333?text=No+Image"
                    alt="No Image Available"
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                )}
              </div>
            </div>

            {/* Product Information Column */}
            <div className="w-full px-4 lg:w-1/2">
              <div className="product-details">
                <h1 className="mb-4 text-3xl font-bold text-gray-800">{product?.name}</h1>
                <div className="mb-6 flex items-center gap-2">
                  {product?.discountPrice ? (
                    <>
                      <span className="text-2xl font-bold text-blue-600">${product.discountPrice.toFixed(2)}</span>
                      <span className="text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">${product?.price.toFixed(2)}</span>
                  )}
                </div>

                <p className="mb-6 text-gray-700">{product?.description}</p>

                <div className="mb-6 flex items-center gap-4">
                  <span className="font-medium text-gray-800">Quantity:</span>
                  <div className="flex items-center rounded-md border border-gray-300">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-l-md"
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-2 text-gray-800">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded-r-md"
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition duration-300"
                  >
                    <MdCheckCircle /> Add to Cart
                  </button>
                  {/* <button
                    onClick={handleAddToWishlist}
                    className="flex items-center gap-2 rounded-md border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50 transition duration-300"
                  >
                    <FaHeart /> Add to Wishlist
                  </button> */}
                </div>

                <div className="mt-8 text-gray-700">
                  <p>
                    <span className="font-semibold">Category:</span> {product?.category}
                  </p>
                  <p>
                    <span className="font-semibold">Availability:</span> {product?.stock !== undefined && product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section - Designed to match the image */}
      {product && (
        <section id="reviews" className="py-16 lg:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-10 text-center">Customer Reviews</h2>

            {totalReviews > 0 ? (
              <>
                {/* Overall Rating Summary and Star Distribution */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-12 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
                  {/* Average Rating Display */}
                  <div className="flex flex-col items-center justify-center min-w-[200px] p-4 bg-blue-50 rounded-lg border border-blue-100 shadow-inner">
                    <p className="text-6xl font-extrabold text-blue-700">{averageRating}</p>
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>
                          {/* Render filled stars based on average rating (using Math.floor for full stars) */}
                          {i < Math.floor(averageRating) ? (
                            <FaStar className="text-yellow-500" size={32} />
                          ) : (
                            <FaRegStar className="text-gray-400" size={32} />
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-lg text-gray-700 mt-3 font-medium">Based on {totalReviews} reviews</p>
                  </div>

                  {/* Star Distribution Progress Bars */}
                  <div className="flex-1 w-full md:w-auto p-4">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = starCounts[star as keyof typeof starCounts];
                      // Calculate percentage, ensuring no division by zero
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-4 mb-3">
                          {/* Star count label with a yellow star icon */}
                          <span className="text-gray-800 font-semibold w-10 text-right flex items-center justify-end">
                            {star} <FaStar className="inline text-yellow-500 ml-1" size={18} />
                          </span>
                          {/* Progress bar container */}
                          <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                            <div
                              className="bg-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          {/* Number of reviews for this star rating */}
                          <span className="text-gray-700 text-md w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Reviews List */}
                <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">What Our Customers Say</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reviews.map((review: Review) => (
                    <li key={review._id} className="p-6 border border-gray-200 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1">
                          {/* Render individual review stars */}
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>
                              {i < review.rating ? (
                                <FaStar className="text-yellow-500" size={18} />
                              ) : (
                                <FaRegStar className="text-gray-400" size={18} />
                              )}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          ({review.rating} stars)
                        </span>
                      </div>
                      <p className="mt-2 text-gray-800 text-base leading-relaxed italic">"{review.comment}"</p>
                      <p className="text-sm text-gray-500 mt-4 pt-2 border-t border-gray-100">
                        By <span className="font-semibold">{review.user?.name || 'Anonymous'}</span>, on {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              // Message displayed if there are no reviews
              <p className="text-xl text-gray-600 text-center py-10">No reviews yet for this product. Be the first to share your experience!</p>
            )}
          </div>
        </section>
      )}

      {/* Recently Viewed Items Section */}
      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;
