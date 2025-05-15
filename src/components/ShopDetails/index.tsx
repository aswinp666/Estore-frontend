"use client";
import React, { useEffect, useState } from "react";
import { FaHeart, FaMinus, FaPlus } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { useAppSelector } from "@/redux/store";

const ShopDetails = () => {
  const [quantity, setQuantity] = useState(1);

  const alreadyExist = localStorage.getItem("productDetails");
  const productFromStorage = useAppSelector((state) => state.productDetailsReducer.value);
  const product = alreadyExist ? JSON.parse(alreadyExist) : productFromStorage;

  useEffect(() => {
    localStorage.setItem("productDetails", JSON.stringify(product));
  }, [product]);

  return (
    <>
      <Breadcrumb title="Shop Details" pages={["shop details"]} />
      {product?.name ? (
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
              <div className="lg:max-w-[570px] w-full">
                <div className="rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 flex items-center justify-center">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="max-w-[539px] w-full">
                <h2 className="font-semibold text-2xl text-dark mb-3">{product.name}</h2>

                <div className="flex items-center gap-2 text-[#FFA645] mb-4">
                  {Array(5).fill(0).map((_, i) => (
                    <AiFillStar key={i} />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(5 customer reviews)</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <MdCheckCircle className="text-green" size={20} />
                  <span className="text-green">In Stock</span>
                </div>

                <h3 className="text-xl font-bold text-dark mb-3">₹{product.price}</h3>

                <p className="text-base text-gray-700 mb-6">{product.description}</p>

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
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
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

                  <button className="bg-blue text-white px-6 py-3 rounded-md hover:bg-blue-dark">
                    Purchase Now
                  </button>

                  <button className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:text-white hover:bg-dark">
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div className="text-center text-lg py-20">Please add a product.</div>
      )}

      <Newsletter />
      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;
