import { Menu } from "@/types/Menu";

export const menuData: Menu[] = [
  {
    id: 1,
    name: "Popular",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    name: "Browse by Category",
    newTab: false,
    path: "/shop-with-sidebar",
  },
  {
    id: 3,
    name: "Contact",
    newTab: false,
    path: "/contact",
  },
  {
    id: 6,
    name: "pages",
    newTab: false,
    path: "/",
    submenu: [
      {
        id: 61,
        name: "Shop With Sidebar",
        newTab: false,
        path: "/shop-with-sidebar",
      },
      {
        id: 64,
        name: "Checkout",
        newTab: false,
        path: "/checkout",
      },
      {
        id: 65,
        name: "Cart",
        newTab: false,
        path: "/cart",
      },
      {
        id: 66,
        name: "Wishlist",
        newTab: false,
        path: "/wishlist",
      },
      {
        id: 67,
        name: "Sign in",
        newTab: false,
        path: "/signin",
      },
      {
        id: 68,
        name: "Sign up",
        newTab: false,
        path: "/signup",
      },
      {
        id: 69,
        name: "My Account",
        newTab: false,
        path: "/my-account",
      },
      {
        id: 70,
        name: "Contact",
        newTab: false,
        path: "/contact",
      },
    ],
  },
];
