// src/app/(site)/shop-details/index.tsx
"use client";
import React, { useEffect, useState, useMemo } from "react";
import { FaHeart, FaMinus, FaPlus, FaUserCircle } from "react-icons/fa";
import { MdCheckCircle } from "react-icons/md";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
// import Newsletter from "src/app/(site)/Common/Newsletter"; // Ensure correct path if changed
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { FaStar, FaRegStar } from 'react-icons/fa';

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

  const productFromRedux = useAppSelector((state) => state.productDetailsReducer.value);

  const product = useMemo(() => {
    if (productFromRedux && productFromRedux._id && productFromRedux._id !== "0") {
      return productFromRedux;
    }
    const alreadyExist = typeof window !== 'undefined' ? localStorage.getItem("productDetails") : null;
    if (alreadyExist) {
      try {
        const parsedProduct = JSON.parse(alreadyExist);
        if (parsedProduct && parsedProduct._id !== "0") {
          return parsedProduct;
        }
      } catch (e) {
        console.error("Error parsing productDetails from localStorage", e);
      }
    }
    return null;
  }, [productFromRedux]);

  useEffect(() => {
    if (product && product._id && product._id !== "0") {
      localStorage.setItem("productDetails", JSON.stringify(product));
    } else if (typeof window !== 'undefined' && localStorage.getItem("productDetails")) {
      localStorage.removeItem("productDetails");
    }
  }, [product]);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!product?._id || product._id === '0') {
        setReviews([]);
        setLoadingReviews(false);
        return;
      }
      setLoadingReviews(true);
      setErrorReviews(null);
      try {
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

    if (product?._id) {
      fetchReviews();
    }
  }, [product?._id]);

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
        discountedPrice: product.discountedPrice !== undefined ? product.discountedPrice : product.price,
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
        discountedPrice: product.discountedPrice !== undefined ? product.discountedPrice : product.price,
      })
    );
  };

  return (
    <>
      <Breadcrumb title="Shop Details" pages={["shop details"]} />
      {product && product._id !== "0" && product.name ? (
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
              <div className="lg:max-w-[570px] w-full">
                <div className="rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 flex items-center justify-center">
                  <Image
                    src={product.imageUrl || "/images/placeholder.png"}
                    alt={product.name || "Product image"}
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="max-w-[539px] w-full">
                <h2 className="font-semibold text-2xl text-dark mb-3">{product.name}</h2>

              <div className="flex items-center gap-2 mb-4">
    {[...Array(5)].map((_, i) => (
        <span key={i}>
            {i < filledStarsMain ? (
                <FaStar style={{ color: '#FBBF24' }} size={20} /> 
            ) : (
                <FaRegStar style={{ color: '#9CA3AF' }} size={20} /> 
            )}
        </span>
    ))}
    <span className="text-sm text-gray-600 ml-2">
        {product.averageRating !== undefined && product.averageRating !== null && product.numOfReviews !== undefined
            ? `(${product.averageRating.toFixed(1)} / ${product.numOfReviews} ${product.numOfReviews === 1 ? 'customer review' : 'customer reviews'})`
            : '(No reviews yet)'}
    </span>
</div>

                <div className="flex items-center gap-2 mb-4">
                  <MdCheckCircle className="text-green" size={20} />
                  <span className="text-green">In Stock</span>
                </div>

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

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      className="w-10 h-10 flex items-center justify-center"
                      onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
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
                  </button>

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

      {/* USER RATINGS AND REVIEWS SECTION - MODIFIED BELOW */}
      {product && product._id !== "0" && (
        <section className="py-10 bg-gray-50"> {/* Optional: Add a light background to the whole section */}
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <h2 className="text-2xl font-semibold mb-6 text-center sm:text-left">User Ratings and Reviews</h2>

            {loadingReviews ? (
              <p className="text-center">Loading reviews...</p>
            ) : errorReviews ? (
              <p className="text-red-500 text-center">Error: {errorReviews}</p>
            ) : reviews.length > 0 ? (
              <ul className="flex flex-wrap -mx-2"> {/* MODIFIED: Flex container for grid layout, negative margin for gutter */}
                {reviews.map((review: Review) => (
                  <li key={review._id} className="w-full sm:w-1/2 lg:w-1/4 px-2 mb-4"> {/* MODIFIED: Width for columns, padding for gutter, margin bottom */}
                    <div className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col"> {/* MODIFIED: Card styling, no border, full height, flex column */}
                      <div className="flex items-start gap-3 mb-2"> {/* items-start for avatar alignment */}
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 flex-shrink-0">
                          <FaUserCircle size={28} />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-semibold text-dark"> {/* text-lg removed for compactness */}
                            {review.user?.name || 'Anonymous'}
                          </h4>
                          <div className="flex items-center gap-0.5 review-stars mt-0.5" style={{ '--rating': review.rating } as React.CSSProperties}>
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "star filled" : "star"}>
                                <FaStar size={14} /> {/* Smaller stars for compactness */}
                              </span>
                            ))}
                            <style jsx>{`
                              .review-stars .star {
                                color: #d1d5db; /* Tailwind gray-300 or 400 */
                              }
                              .review-stars .star.filled {
                                color: #f59e0b; /* Tailwind amber-500 or yellow-500 */
                              }
                            `}</style>
                          </div>
                          <p className="text-xs text-gray-500 mt-1"> {/* Smaller date text */}
                            Reviewed on {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 leading-relaxed"> {/* Smaller comment text, adjusted margin, leading for readability */}
                        {review.comment}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center">No reviews yet for this product.</p>
            )}
          </div>
        </section>
      )}

      {/* <Newsletter /> */}
      {/* <RecentlyViewdItems /> */}
    </>
  );
};

export default ShopDetails;