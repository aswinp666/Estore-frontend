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

// Map categories to the options they should show
const categoryOptionsMap: Record<string, string[]> = {
  Mobile: ["Color", "RAM"],
  Console: ["Color"],
  TV: [],
  Laptop: ["Color", "RAM"],
  // Add more categories as needed
};

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const userEmail = useSelector((state: RootState) => state.authReducer.user?.email);
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);

  // Get the options to display based on product category
  const optionsToShow = categoryOptionsMap[item.category] || [];

  // Initialize selected options (default to first available or empty string)
  const [selectedColor, setSelectedColor] = useState(
    optionsToShow.includes("Color") && item.options?.Color?.length
      ? item.options.Color[0]
      : ""
  );
  const [selectedRAM, setSelectedRAM] = useState(
    optionsToShow.includes("RAM") && item.options?.RAM?.length ? item.options.RAM[0] : ""
  );

  const handleAddToCart = () => {
    if (!userEmail) {
      alert("Please log in to add items to cart.");
      return;
    }

    dispatch(
      addItemToCart({
        _id: item._id,
        name: `${item.name}${selectedRAM ? " - " + selectedRAM : ""}${
          selectedColor ? " - " + selectedColor : ""
        }`,
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

      {/* Conditionally render Color options */}
      {optionsToShow.includes("Color") && item.options?.Color && (
        <div className="flex gap-2 mb-2">
          {item.options.Color.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${
                selectedColor === color ? "border-black" : "border-gray-300"
              }`}
              style={{ backgroundColor: color.toLowerCase() }}
              onClick={() => setSelectedColor(color)}
              aria-label={`Color ${color}`}
            />
          ))}
        </div>
      )}

      {/* Conditionally render RAM options */}
      {optionsToShow.includes("RAM") && item.options?.RAM && (
        <div className="flex gap-2 mb-3">
          {item.options.RAM.map((ram) => (
            <label key={ram} className="flex items-center gap-1 text-sm cursor-pointer">
              <input
                type="radio"
                name={`ram-${item._id}`}
                value={ram}
                checked={selectedRAM === ram}
                onChange={() => setSelectedRAM(ram)}
              />
              {ram}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductItem;
