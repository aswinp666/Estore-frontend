"use client";
import React from "react";
import Image from "next/image";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist } from "@/redux/features/wishlist-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Link from "next/link";
import { Heart } from "lucide-react";

const ProductItem = ({ item }: { item: Product }) => {
  const { openModal } = useModalContext();
  const dispatch = useDispatch<AppDispatch>();

  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  const handleAddToCart = (item: Product) => {
    dispatch(
      addItemToCart({
        _id: item._id,  // ✅ Correct
        name: item.name,
        price: item.price,
        quantity: 1,
        imageUrl: item.imageUrl,
      })
    );
  };
  
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
    <div className="group">
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
  onClick={() => handleAddToCart(item)}
  className="inline-flex font-medium text-custom-sm py-[7px] px-5 rounded-[5px] bg-blue text-white ease-out duration-200 hover:bg-blue-dark"
>
  Add to cart
</button>


<button
  onClick={handleItemToWishList}
  aria-label="Add to wishlist"
  className="flex items-center justify-center w-9 h-9 rounded-[5px] shadow-1 ease-out duration-200 text-black bg-white hover:text-blue"
>
  <Heart className="w-5 h-5" /> {/* Example using lucide-react */}
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

      <div className="flex items-center gap-2 font-medium text-lg">
        <span className="text-dark">₹{item.discountedPrice || item.price}</span>
        {item.discountedPrice && item.discountedPrice !== item.price && (
          <span className="text-dark-4 line-through">₹{item.price}</span>
        )}
      </div>
    </div>
  );
};

export default ProductItem;