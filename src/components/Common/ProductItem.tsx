"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import Link from "next/link";
import { Heart } from "lucide-react";

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const userEmail = useSelector((state: RootState) => state.authReducer.user?.email);
  const cartItems = useSelector((state: RootState) => state.cartReducer.items);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialSelected: Record<string, string> = {};
    for (const optionName in item.options || {}) {
      const values = item.options?.[optionName];
      if (values && values.length) {
        initialSelected[optionName] = values[0];
      }
    }
    setSelectedOptions(initialSelected);
  }, [item]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = () => {
    if (!userEmail) {
      alert("Please log in to add items to cart.");
      return;
    }

    const optionStrings = Object.entries(selectedOptions).map(
      ([key, val]) => ` - ${val}`
    );

    dispatch(
  addItemToCart({
    productId: item._id,  // <-- Use productId key here!
    name: `${item.name}${optionStrings.join("")}`,
    price: item.price,
    discountedPrice: item.discountedPrice || item.price,
    quantity: 1,
    imageUrl: item.imageUrl,
  })
);
};

  // Save cart to backend on cartItems or userEmail change
  useEffect(() => {
    if (!userEmail) return;

    const saveCart = async () => {
      const payload = {
        userEmail,
        cartItems: cartItems.map((ci) => ({
          _id: ci.productId,
          name: ci.name,
          price: ci.price,
          discountedPrice: ci.discountedPrice || ci.price,
          quantity: ci.quantity,
          imageUrl: ci.imageUrl,
        })),
      };

      console.log("Sending cart to backend:", payload); // DEBUG LOG

      try {
        const res = await fetch("https://estore-backend-dyl3.onrender.com/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Failed to save cart, status:", res.status);
        } else {
          console.log("Cart saved successfully");
        }
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

      {Object.entries(item.options || {}).map(([optionName, values]) => {
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
<div key={optionName} style={{ display: 'flex', gap: '16px', marginBottom: '12px', alignItems: 'center' }}>
  <span style={{ fontWeight: '500' }}>{optionName}:</span>
  {values.map((value) => {
    const isSelected = selectedOptions[optionName] === value;
    return (
      <label
        key={value}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '14px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <input
          type="radio"
          name={`${optionName}-${item._id}`}
          value={value}
          checked={isSelected}
          onChange={() => handleOptionChange(optionName, value)}
          style={{
            appearance: 'none',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            border: isSelected ? '2px solid #1e90ff' : '2px solid #999',
            backgroundColor: isSelected ? '#1e90ff' : 'white',
            display: 'inline-block',
            position: 'relative',
          }}
        />
        {value}
      </label>
    );
  })}
</div>

          );
        }
      })}
    </div>
  );
};

export default ProductItem;
