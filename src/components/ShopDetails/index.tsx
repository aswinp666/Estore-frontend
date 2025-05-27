// src/app/(site)/shop-details/index.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FaHeart, FaMinus, FaPlus } from "react-icons/fa";
// Removed AiFillStar as it's replaced by FaStar/FaRegStar for consistency
import { MdCheckCircle } from "react-icons/md";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";

// NEW: Import Font Awesome star icons for dynamic rendering
import { FaStar, FaRegStar } from 'react-icons/fa';

// Define a type for reviews to improve type safety
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

const ShopDetails = () => {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch<AppDispatch>();

  const alreadyExist = localStorage.getItem("productDetails");
  const productFromStorage = useAppSelector((state) => state.productDetailsReducer.value);

  // Ensure product has a default structure if not found in storage or Redux
  const product = alreadyExist
    ? JSON.parse(alreadyExist)
    : (productFromStorage._id !== "0" ? productFromStorage : null); // Check for default empty product

  // NEW: State for product reviews and loading/error states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  useEffect(() => {
    // Save to local storage only if product is valid
    if (product && product._id !== "0") {
      localStorage.setItem("productDetails", JSON.stringify(product));
    } else {
      localStorage.removeItem("productDetails"); // Clear if product is invalid
    }

    // NEW: Fetch reviews for the product
    const fetchReviews = async () => {
      if (!product?._id || product._id === '0') { // Only fetch if product ID is valid
        setReviews([]); // Clear reviews if no product or default product
        setLoadingReviews(false);
        return;
      }
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
        // IMPORTANT: Make sure this API endpoint is correct for fetching reviews for a product ID
        const res = await fetch(`https://estore-backend-dyl3.onrender.com/api/products/${product._id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        } else {
          const errorData = await res.json();
          setErrorReviews(errorData.message || "Failed to fetch reviews.");
        }
      } catch (error: any) {
        console.error("Error fetching reviews:", error);
        setErrorReviews(error.message || "An unexpected error occurred while fetching reviews.");
      } finally {
        setLoadingReviews(false);
      }
    };

    if (product?._id) { // Trigger fetch when product ID changes
      fetchReviews();
    }
  }, [product?._id, product]); // Depend on product._id to re-fetch if product changes

  // Calculate filled stars for main product display based on averageRating
  const filledStarsMain = Math.round(Number(product?.averageRating) || 0);

  const handleAddToCart = () => {
    if (!product || product._id === "0") {
      alert("Please select a valid product first.");
      return;
    }
    dispatch(
      addItemToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        discountedPrice: product.discountedPrice !== undefined ? product.discountedPrice : product.price, // Ensure discountedPrice is included
        quantity,
        imageUrl: product.imageUrl,
      })
    );
  };

  const handleAddToWishlist = () => {
    if (!product || product._id === "0") {
      alert("Please select a valid product first.");
      return;
    }
    dispatch(
      addItemToWishlist({
        ...product,
        status: "available",
        quantity: 1,
        // Ensure discountedPrice is explicitly handled if WishListItem requires it
        discountedPrice: product.discountedPrice !== undefined ? product.discountedPrice : product.price,
      })
    );
  };

  return (
    <>
      <Breadcrumb title="Shop Details" pages={["shop details"]} />
      {/* Check if a valid product object is loaded before rendering details */}
      {product && product._id !== "0" && product.name ? (
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
              <div className="lg:max-w-[570px] w-full">
                <div className="rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 flex items-center justify-center">
                  <Image
                    src={product.imageUrl || "/images/placeholder.png"} // Added fallback for imageUrl
                    alt={product.name || "Product image"} // Added fallback for alt text
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="max-w-[539px] w-full">
                <h2 className="font-semibold text-2xl text-dark mb-3">{product.name}</h2>

                <div className="flex items-center gap-2 mb-4"> {/* Removed text-[#FFA645] as color is set by icons */}
                  {/* Dynamic star display for overall average rating */}
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < filledStarsMain ? (
                        <FaStar className="text-yellow-500" size={20} />
                      ) : (
                        <FaRegStar className="text-gray-400" size={20} />
                      )}
                    </span>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    {/* Display average rating and total number of reviews */}
                    {product.averageRating !== undefined && product.averageRating !== null && product.numOfReviews !== undefined
                      ? `(${product.averageRating.toFixed(1)} / ${product.numOfReviews} ${product.numOfReviews === 1 ? 'customer review' : 'customer reviews'})`
                      : '(No reviews yet)'}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <MdCheckCircle className="text-green" size={20} />
                  <span className="text-green">In Stock</span>
                </div>

                {/* Price display with discounted price */}
                <h3 className="text-xl font-bold text-dark mb-3">
                  {product.discountedPrice !== undefined && product.discountedPrice !== product.price ? (
                    <>
                      <span className="text-dark">₹{product.discountedPrice.toFixed(2)}</span>
                      <span className="text-dark-4 line-through ml-2">₹{product.price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-dark">₹{product.price.toFixed(2)}</span>
                  )}
                </h3>

                <p className="text-base text-gray-700 mb-6">{product.description || "No description available."}</p>

                <ul className="text-sm text-gray-700 mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-blue" />
                    Free delivery available
                  </li>
                  <li className="flex items-center gap-2">
                    <MdCheckCircle className="text-blue" />
                    Use Code: PROMO30 for 30% Off
                  </li>
                </ul>

                {/* Quantity and Add to Cart/Wishlist Buttons */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="w-10 h-10 flex items-center justify-center"
                      onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} // Prevent quantity from going below 1
                    >
                      <FaMinus />
                    </button>
                    <span className="w-12 h-10 flex items-center justify-center border-x border-gray-200">
                      {quantity}
                    </span>
                    <button
                      className="w-10 h-10 flex items-center justify-center"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <button
                    className="bg-blue text-white px-6 py-3 rounded-md hover:bg-blue-dark"
                    onClick={handleAddToCart}
                  >
                    Add to Cart
                  </button> {/* Changed "Purchase Now" to "Add to Cart" for clarity, adjust if needed */}

                  <button
                    className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:text-white hover:bg-dark"
                    onClick={handleAddToWishlist}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center text-lg py-20">Please select a product to view details.</div>
      )}

      {/* NEW: Reviews Section for Product Details Page */}
      {product && product._id !== "0" && ( // Only show if a valid product is loaded
        <section className="py-10">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <h2 className="text-2xl font-semibold mb-5">User Ratings and Reviews</h2>

            {loadingReviews ? (
              <p>Loading reviews...</p>
            ) : errorReviews ? (
              <p className="text-red-500">Error: {errorReviews}</p>
            ) : reviews.length > 0 ? (
              <ul>
                {reviews.map((review: Review) => ( // Use Review type for clarity
                  <li key={review._id} className="mb-5 p-4 border rounded-md shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>
                            {i < review.rating ? (
                              <FaStar className="text-yellow-500" size={16} />
                            ) : (
                              <FaRegStar className="text-gray-400" size={16} />
                            )}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        ({review.rating} stars)
                      </span>
                    </div>
                    <p className="mt-2 text-gray-800">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      By {review.user?.name || 'Anonymous'}, {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No reviews yet for this product.</p>
            )}
          </div>
        </section>
      )}

      <Newsletter />
      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;