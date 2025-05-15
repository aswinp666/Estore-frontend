// Refactored ShopDetails: Removed color-type-storage-sim options, additional info and review tabs, and replaced SVG icons with React Icons

"use client";
import React, { useEffect, useState } from "react";
import { FaSearchPlus, FaHeart, FaMinus, FaPlus } from "react-icons/fa";
import { AiFillStar } from "react-icons/ai";
import { MdCheckCircle } from "react-icons/md";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "./RecentlyViewd";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useAppSelector } from "@/redux/store";

const ShopDetails = () => {
  const { openPreviewModal } = usePreviewSlider();
  const [previewImg, setPreviewImg] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const alreadyExist = localStorage.getItem("productDetails");
  const productFromStorage = useAppSelector((state) => state.productDetailsReducer.value);
  const product = alreadyExist ? JSON.parse(alreadyExist) : productFromStorage;

  useEffect(() => {
    localStorage.setItem("productDetails", JSON.stringify(product));
  }, [product]);

  const handlePreviewSlider = () => {
    openPreviewModal();
  };

  return (
    <>
      <Breadcrumb title={"Shop Details"} pages={["shop details"]} />
      {product.title === "" ? (
        "Please add product"
      ) : (
        <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
              <div className="lg:max-w-[570px] w-full">
                <div className="lg:min-h-[512px] rounded-lg shadow-1 bg-gray-2 p-4 sm:p-7.5 relative flex items-center justify-center">
                  <div>
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="zoom"
                      className="w-11 h-11 rounded bg-gray-1 shadow-1 flex items-center justify-center absolute top-4 right-4 z-50 hover:text-blue"
                    >
                      <FaSearchPlus className="text-xl" />
                    </button>
                    <Image
                      src={product.imgs?.previews[previewImg]}
                      alt="products-details"
                      width={400}
                      height={400}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-4.5 mt-6">
                  {product.imgs?.thumbnails.map((item, key) => (
                    <button
                      onClick={() => setPreviewImg(key)}
                      key={key}
                      className={`w-15 sm:w-25 h-15 sm:h-25 overflow-hidden rounded-lg bg-gray-2 shadow-1 border-2 hover:border-blue ${key === previewImg ? "border-blue" : "border-transparent"}`}
                    >
                      <Image width={50} height={50} src={item} alt="thumbnail" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-w-[539px] w-full">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-xl sm:text-2xl xl:text-custom-3 text-dark">
                    {product.title}
                  </h2>
                  <div className="inline-flex font-medium text-custom-sm text-white bg-blue rounded py-0.5 px-2.5">
                    30% OFF
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5.5 mb-4.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 text-[#FFA645]">
                      {Array(5).fill(0).map((_, i) => (
                        <AiFillStar key={i} />
                      ))}
                    </div>
                    <span> (5 customer reviews) </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MdCheckCircle className="text-green" size={20} />
                    <span className="text-green">In Stock</span>
                  </div>
                </div>

                <h3 className="font-medium text-custom-1 mb-4.5">
                  <span className="text-sm sm:text-base text-dark">
                    Price: ${product.price}
                  </span>
                  <span className="line-through"> ${product.discountedPrice} </span>
                </h3>

                <ul className="flex flex-col gap-2">
                  <li className="flex items-center gap-2.5">
                    <MdCheckCircle className="text-blue" size={20} />
                    Free delivery available
                  </li>
                  <li className="flex items-center gap-2.5">
                    <MdCheckCircle className="text-blue" size={20} />
                    Sales 30% Off Use Code: PROMO30
                  </li>
                </ul>

                <div className="flex flex-wrap items-center gap-4.5 mt-7.5">
                  <div className="flex items-center rounded-md border border-gray-3">
                    <button
                      aria-label="remove product"
                      className="w-12 h-12 hover:text-blue"
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    >
                      <FaMinus />
                    </button>
                    <span className="w-16 h-12 flex items-center justify-center border-x border-gray-4">
                      {quantity}
                    </span>
                    <button
                      aria-label="add product"
                      className="w-12 h-12 hover:text-blue"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <a
                    href="#"
                    className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md hover:bg-blue-dark"
                  >
                    Purchase Now
                  </a>

                  <a
                    href="#"
                    className="w-12 h-12 rounded-md border border-gray-3 flex items-center justify-center hover:text-white hover:bg-dark hover:border-transparent"
                  >
                    <FaHeart />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <Newsletter />
      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;
