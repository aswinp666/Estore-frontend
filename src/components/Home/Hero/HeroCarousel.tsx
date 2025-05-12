"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { addItemToCart } from "@/redux/features/cart-slice";
import { AppDispatch } from "@/redux/store";

type Product = {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
  description: string;
  price?: number;
  discountedPrice?: number;
};

const HeroCarousal = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://estore-backend-dyl3.onrender.com/api/products");
        const data: Product[] = await res.json();
        const smartWatches = data.filter((item) => item.category === "Offer Products");
        setProducts(smartWatches);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(
      addItemToCart({
        _id: product.id, // Assuming `id` maps to `_id` in your cart item type
        name: product.name,
        price: product.discountedPrice || product.price || 0,
        quantity: 1,
        imageUrl: product.imageUrl,
      })
    );
  };

  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      modules={[Autoplay, Pagination]}
      className="hero-carousel"
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <div className="flex items-center pt-6 sm:pt-0 flex-col-reverse sm:flex-row">
            <div className="max-w-[394px] py-10 sm:py-15 lg:py-24.5 pl-4 sm:pl-7.5 lg:pl-12.5">
              <div className="flex items-center gap-4 mb-7.5 sm:mb-10">
                <span className="block font-semibold text-heading-3 sm:text-heading-1 text-blue">
                  30%
                </span>
                <span className="block text-dark text-sm sm:text-custom-1 sm:leading-[24px]">
                  Sale
                  <br />
                  Off
                </span>
              </div>

              <h1 className="font-semibold text-dark text-xl sm:text-3xl mb-3">
                <a href="#">{product.name}</a>
              </h1>

              <p>{product.description}</p>

              <button
                onClick={() => handleAddToCart(product)}
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
              >
                Shop Now
              </button>
            </div>

            <div>
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={351}
                height={358}
              />
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default HeroCarousal;
