import { Product } from "@/types/product";

const shopData: Product[] = [
  {
    name: "Havit HV-G69 USB Gamepad",
    // REMOVE 'reviews: 15,'
    averageRating: 4.5, // Example average rating
    numOfReviews: 15,   // Example number of reviews
    price: 59.0,
    discountedPrice: 29.0,
    _id: "1",
    category: "Gaming",
    imageUrl: "/images/products/product-1-bg-1.png",
    // description: "A high-quality USB gamepad for an immersive gaming experience.", // Added description
    options: { // Added options, if applicable
        Color: ["Black"],
    }
  },
  {
    name: "iPhone 14 Plus , 6/128GB",
    // REMOVE 'reviews: 5,'
    averageRating: 4.8,
    numOfReviews: 5,
    price: 899.0,
    discountedPrice: 99.0, // Note: This discountedPrice (99.0) seems very low compared to price (899.0). Adjust if needed.
    _id: "2",
    category: "Mobiles",
    imageUrl: "/images/products/product-2-bg-1.png",
    // description: "The latest iPhone with a large display and powerful performance.",
    options: {
        Color: ["Blue", "Midnight"],
        RAM: ["6GB"],
    }
  },
  {
    name: "Apple iMac M1 24-inch 2021",
    // REMOVE 'reviews: 5,'
    averageRating: 4.7,
    numOfReviews: 5,
    price: 59.0, // Note: This price seems very low for an iMac. Adjust if needed.
    discountedPrice: 29.0, // Note: This discountedPrice seems very low for an iMac. Adjust if needed.
    _id: "3",
    category: "Computers",
    imageUrl: "/images/products/product-3-bg-1.png",
    // description: "Stunning all-in-one desktop computer with Apple's M1 chip.",
    options: {
        Color: ["Silver", "Blue"],
    }
  },
  {
    name: "MacBook Air M1 chip, 8/256GB",
    // REMOVE 'reviews: 6,'
    averageRating: 4.9,
    numOfReviews: 6,
    price: 59.0, // Note: This price seems very low for a MacBook. Adjust if needed.
    discountedPrice: 29.0, // Note: This discountedPrice seems very low for a MacBook. Adjust if needed.
    _id: "4",
    category: "Laptops",
    imageUrl: "/images/products/product-4-bg-1.png",
    // description: "Ultra-thin and light laptop powered by the M1 chip.",
    options: {
        Color: ["Space Gray", "Gold"],
    }
  },
  {
    name: "Apple Watch Ultra",
    // REMOVE 'reviews: 3,'
    averageRating: 4.6,
    numOfReviews: 3,
    price: 99.0, // Note: This price seems very low for an Apple Watch Ultra. Adjust if needed.
    discountedPrice: 29.0, // Note: This discountedPrice seems very low. Adjust if needed.
    _id: "5",
    category: "Wearables",
    imageUrl: "/images/products/product-5-bg-1.png",
    // description: "Rugged and capable smartwatch for adventurers.",
    options: {
        Color: ["Titanium"],
    }
  },
  {
    name: "Logitech MX Master 3 Mouse",
    // REMOVE 'reviews: 15,'
    averageRating: 4.7,
    numOfReviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    _id: "6",
    category: "Accessories",
    imageUrl: "/images/products/product-6-bg-1.png",
    // description: "Advanced ergonomic mouse for power users.",
    options: {
        Color: ["Graphite"],
    }
  },
  {
    name: "Apple iPad Air 5th Gen - 64GB",
    // REMOVE 'reviews: 15,'
    averageRating: 4.8,
    numOfReviews: 15,
    price: 59.0, // Note: This price seems very low for an iPad Air. Adjust if needed.
    discountedPrice: 29.0, // Note: This discountedPrice seems very low. Adjust if needed.
    _id: "7",
    category: "Tablets",
    imageUrl: "/images/products/product-7-bg-1.png",
    // description: "Powerful and versatile iPad Air with M1 chip.",
    options: {
        Color: ["Space Gray", "Starlight"],
    }
  },
  {
    name: "Asus RT Dual Band Router",
    // REMOVE 'reviews: 15,'
    averageRating: 4.2,
    numOfReviews: 15,
    price: 59.0,
    discountedPrice: 29.0,
    _id: "8",
    category: "Networking",
    imageUrl: "/images/products/product-8-bg-1.png",
    // description: "High-performance dual-band Wi-Fi router for home networks.",
    options: {
        Color: ["Black"],
    }
  },
];

export default shopData;