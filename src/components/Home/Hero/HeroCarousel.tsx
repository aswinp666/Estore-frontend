"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

type Product = {
  id: number;
  name: string;
  imageUrl: string;
  category: string;
  description: string;
};

const HeroCarousal = () => {
  const [products, setProducts] = useState<Product[]>([]);

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

              <p>
                {product.description}
                <br />
              </p>

              <a
                href="#"
                className="inline-flex font-medium text-white text-custom-sm rounded-md bg-dark py-3 px-9 ease-out duration-200 hover:bg-blue mt-10"
              >
                Shop Now
              </a>
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
