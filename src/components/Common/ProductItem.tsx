"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";
import { Heart } from "lucide-react";

// Define options per category with option names and their values
const categoryOptionsMap: Record<
  string,
  Record<string, string[]>
> = {
  TV: { Size: ["50 inch", "55 inch"] },
  Mobile: { Color: ["Red", "Black", "Silver", "White"], RAM: ["8GB", "12GB"] },
  Consoles: { Edition: ["Digital Edition", "Standard Edition"] },
  Earpods: { Color: ["Black", "Silver", "White"] },
  Tablets: { Color: ["Black", "White"], RAM: ["8GB", "12GB"] },
  Laptop: { Color: ["Black", "Silver"], RAM: ["8GB", "16GB"] },
  // Add more categories & options as needed
};

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const userEmail = useSelector((state: RootState) => state.authReducer.user?.email);
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);

  // Get the options object for this product category
  const optionsForCategory = categoryOptionsMap[item.category] || {};

  // State: keep selected value for each option name dynamically
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Initialize selected options on mount or when item/category changes
  useEffect(() => {
    const initialSelected: Record<string, string> = {};
    for (const optionName in optionsForCategory) {
      // If product also provides option values (in item.options), use that, else from categoryOptionsMap
      const values =
        item.options?.[optionName] && item.options[optionName].length
          ? item.options[optionName]
          : optionsForCategory[optionName];

      initialSelected[optionName] = values[0] || "";
    }
    setSelectedOptions(initialSelected);
  }, [item, optionsForCategory]);

  // Handle option change dynamically
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!userEmail) {
      alert("Please log in to add items to cart.");
      return;
    }

    // Build product name with selected options appended
    const optionStrings = Object.entries(selectedOptions).map(
      ([key, val]) => ` - ${val}`
    );

    dispatch(
      addItemToCart({
        _id: item._id,
        name: `${item.name}${optionStrings.join("")}`,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      })
    );
  };

  useEffect(() => {
    if (!userEmail) return;

    const saveCart = async () => {
      try {
        await fetch(`https://estore-backend-dyl3.onrender.com/api/cart?email=${userEmail}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail,
            cartItems: cartItems.map((ci) => ({
              productId: ci._id,
              name: ci.name,
              price: ci.price,
              quantity: ci.quantity,
              imageUrl: ci.imageUrl,
            })),
          }),
        });
      } catch (error) {
        console.error("Error saving cart to backend", error);
      }
    };

    saveCart();
  }, [cartItems, userEmail]);

  const handleItemToWishList = () => {
    dispatch(
      addItemToWishlist({
        ...item,
        status: "available",
        quantity: 1,
      })
    );
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
  };

  return (
    <div className="group border rounded-xl p-4 shadow-sm">
      <div className="relative overflow-hidden flex items-center justify-center rounded-lg bg-[#F6F7FB] min-h-[270px] mb-4">
        <Image
          src={item?.imageUrl || "/images/placeholder.png"}
          alt={item?.name || "Product image"}
          width={250}
          height={250}
          className="object-contain"
        />
        <div className="absolute left-0 bottom-0 translate-y-full w-full flex items-center justify-center gap-2.5 pb-5 ease-linear duration-200 group-hover:translate-y-0">
          <button
            onClick={handleAddToCart}
            className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
          >
            Add to cart
          </button>

          <button
            onClick={handleItemToWishList}
            aria-label="Add to wishlist"
            className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-black bg-white hover:text-blue"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Image
              key={i}
              src="/images/icons/icon-star.svg"
              alt="star icon"
              width={14}
              height={14}
            />
          ))}
        </div>
        <p className="text-custom-sm">({item.reviews})</p>
      </div>

      <h3 className="font-medium text-dark ease-out duration-200 hover:text-blue mb-1.5">
        <Link href="/shop-details" onClick={handleProductDetails}>
          {item.name}
        </Link>
      </h3>

      <div className="flex items-center gap-2 font-medium text-lg mb-2">
        <span className="text-dark">₹{item.discountedPrice || item.price}</span>
        {item.discountedPrice && item.discountedPrice !== item.price && (
          <span className="text-dark-4 line-through">₹{item.price}</span>
        )}
      </div>

      {/* Render option groups dynamically */}
      {Object.entries(optionsForCategory).map(([optionName, values]) => {
        // Handle rendering for Color differently (colored circles), else radios for others
        if (optionName.toLowerCase() === "color") {
          return (
            <div key={optionName} className="flex gap-2 mb-2">
              {values.map((color) => (
                <button
                  key={color}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedOptions[optionName] === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.toLowerCase() }}
                  onClick={() => handleOptionChange(optionName, color)}
                  aria-label={`${optionName} ${color}`}
                  type="button"
                />
              ))}
            </div>
          );
        } else {
          return (
            <div key={optionName} className="flex gap-4 mb-3 items-center">
              <span className="font-medium">{optionName}:</span>
              {values.map((value) => (
                <label
                  key={value}
                  className="flex items-center gap-1 text-sm cursor-pointer select-none"
                >
                  <input
                    type="radio"
                    name={`${optionName}-${item._id}`}
                    value={value}
                    checked={selectedOptions[optionName] === value}
                    onChange={() => handleOptionChange(optionName, value)}
                  />
                  {value}
                </label>
              ))}
            </div>
          );
        }
      })}
    </div>
  );
};

export default ProductItem;
