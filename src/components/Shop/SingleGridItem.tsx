// src/components/Shop/SingleGridItem.tsx
"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import Image from "next/image"; // Keep this for the product image

// NEW: Import Font Awesome star icons
import { FaStar, FaRegStar } from 'react-icons/fa';

const SingleGridItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();

  const dispatch = useDispatch<AppDispatch>();

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // add to cart
  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        productId: item._id, // add this line to map _id to productId
        quantity: 1,
      })
    );
  };

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
        // Ensure discountedPrice is explicitly handled if WishListItem requires it
        discountedPrice: item.discountedPrice !== undefined ? item.discountedPrice : item.price,
      })
    );
  };

  // Calculate the number of filled stars based on averageRating
  const filledStars = Math.round(Number(item.averageRating) || 0);

  return (
    <div className="group">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-white shadow-1 min-h-[270px] mb-4">
        <Image
          src={item?.imageUrl || "/images/placeholder.png"}
          alt={item?.name || "Product image"}
          width={250}
          height={250}
        />

        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            id="newOne"
            aria-label="button for quick view"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 5.5C6.61945 5.5 5.50016 6.61929 5.50016 8C5.50016 9.38071 6.61945 10.5 8.00016 10.5C9.38087 10.5 10.5002 9.38071 10.5002 8C10.5002 6.61929 9.38087 5.5 8.00016 5.5ZM6.50016 8C6.50016 7.17157 7.17174 6.5 8.00016 6.5C8.82859 6.5 9.50016 7.17157 9.50016 8C9.50016 8.82842 8.82859 9.5 8.00016 9.5C7.17174 9.5 6.50016 8.82842 6.50016 8Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.00016 2.16666C4.99074 2.16666 2.96369 3.96946 1.78721 5.49791L1.76599 5.52546C1.49992 5.87102 1.25487 6.18928 1.08862 6.5656C0.910592 6.96858 0.833496 7.40779 0.833496 8C0.833496 8.59220 0.910592 9.03142 1.08862 9.4344C1.25487 9.81072 1.49992 10.1290 1.76599 10.4745L1.78721 10.5021C2.96369 12.0305 4.99074 13.8333 8.00016 13.8333C11.0096 13.8333 13.0366 12.0305 14.2131 10.5021L14.2343 10.4745C14.5004 10.1290 14.7455 9.81072 14.9117 9.4344C15.0897 9.03142 15.1668 8.59220 15.1668 8C15.1668 7.40779 15.0897 6.96858 14.9117 6.5656C14.7455 6.18927 14.5004 5.87101 14.2343 5.52545L14.2131 5.49791C13.0366 3.96946 11.0096 2.16666 8.00016 2.16666Z"
                fill=""
              />
            </svg>
          </button>

          <button
            onClick={() => handleAddToCart()}
            className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            Add to cart
          </button>

          <button
            onClick={() => handleItemToWishList()}
            aria-label="button for favorite select"
            id="favOne"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-dark bg-white hover:text-blue"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.74949 2.94946C2.64350 3.45502 1.83325 4.65749 1.83325 6.0914C1.83325 7.55633 2.43273 8.68549 3.29211 9.65318C4.00040 10.4507 4.85781 11.1118 5.69400 11.7564C5.89261 11.9095 6.09002 12.0617 6.28395 12.2146C6.63464 12.4910 6.94747 12.7337 7.24899 12.9099C7.55068 13.0862 7.79352 13.1667 7.99992 13.1667C8.20632 13.1667 8.44916 13.0862 8.75085 12.9099C9.05237 12.7337 9.36520 12.4910 9.71589 12.2146C9.90982 12.0617 10.1072 11.9095 10.3058 11.7564C11.1420 11.1118 11.9994 10.4507 12.7077 9.65318C13.5671 8.68549 14.1666 7.55633 14.1666 6.0914C14.1666 4.65749 13.3563 3.45502 12.2503 2.94946C11.1759 2.45832 9.73214 2.58839 8.36016 4.01382C8.26590 4.11175 8.13584 4.16709 7.99992 4.16709C7.86400 4.16709 7.73393 4.11175 7.63967 4.01382C6.26769 2.58839 4.82396 2.45832 3.74949 2.94946ZM7.99992 2.97255C6.45855 1.59350 4.73256 1.40058 3.33376 2.03998C1.85639 2.71528 0.833252 4.28336 0.833252 6.09140C0.833252 7.86842 1.57358 9.22404 2.54440 10.3172C3.32183 11.1926 4.27340 11.9253 5.11380 12.5724C5.30431 12.7191 5.48911 12.8614 5.66486 12.9999C6.00636 13.2691 6.37295 13.5562 6.74447 13.7733C7.11582 13.9903 7.53965 14.1667 7.99992 14.1667C8.46018 14.1667 8.88401 13.9903 9.25537 13.7733C9.62689 13.5562 9.99348 13.2691 10.3350 12.9999C10.5107 12.8614 10.6955 12.7191 10.8860 12.5724C11.7264 11.9253 12.6780 11.1926 13.4554 10.3172C14.4263 9.22404 15.1666 7.86842 15.1666 6.09140C15.1666 4.28336 14.1434 2.71528 12.6661 2.03998C11.2673 1.40058 9.54129 1.59350 7.99992 2.97255Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content area for the grid item, including the stars for display */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {/* REPLACE THIS SECTION WITH REACT ICONS */}
          {[...Array(5)].map((_, i) => (
            <span key={i}> {/* Use a span to apply color via Tailwind */}
              {i < filledStars ? (
                <FaStar className="text-yellow-500" size={15} /> // Filled star, set color
              ) : (
                <FaRegStar className="text-gray-400" size={15} /> // Empty star, set color
              )}
            </span>
          ))}
        </div>

        {/* Display average rating and total number of reviews */}
      <p className="text-custom-sm">
  {item.averageRating !== undefined && item.averageRating !== null
    ? `(${item.averageRating.toFixed(1)}${item.numOfReviews !== undefined
        ? ` / ${item.numOfReviews} ${item.numOfReviews === 1 ? 'User Rating' : 'User Ratings'}` // MODIFIED PART
        : ''})`
    : '(No reviews)'}
</p>
      </div>

      <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
        <Link href="/shop-details"> {item.name} </Link>
      </h3>

      <span className="flex items-center gap-2 font-medium text-lg">
        {/* Adjusted to display discounted price first, then original if different */}
        {item.discountedPrice !== undefined && item.discountedPrice !== item.price ? (
          <>
            <span className="text-dark">₹{item.discountedPrice.toFixed(2)}</span>
            <span className="text-dark-4 line-through">₹{item.price.toFixed(2)}</span>
          </>
        ) : (
          <span className="text-dark">₹{item.price.toFixed(2)}</span>
        )}
      </span>
    </div>
  );
};

export default SingleGridItem;