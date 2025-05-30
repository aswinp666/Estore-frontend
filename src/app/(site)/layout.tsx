"use client";
import { useState, useEffect } from "react";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { ModalProvider } from "../context/QuickViewModalContext";
import { CartModalProvider } from "../context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import ScrollToTop from "@/components/Common/ScrollToTop";
import PreLoader from "@/components/Common/PreLoader";
import CartLoader from "../../components/CartLoader";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setUser } from "@/redux/features/auth-slice";
import { clearCart,fetchUserCart } from "@/redux/features/cart-slice";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body>
        <ReduxProvider>
          <InnerLayout>{children}</InnerLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}

function InnerLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate preloader timeout
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

 useEffect(() => {
  const user = localStorage.getItem("user");

  if (user) {
    const parsedUser = JSON.parse(user);
    dispatch(setUser(parsedUser));
    dispatch(fetchUserCart());
  } else {
    dispatch(clearCart()); // ✅ clear Redux cart if user not found
  }
}, [dispatch]);

  return (
    <CartModalProvider>
      <ModalProvider>
        <PreviewSliderProvider>
          {loading ? (
            <PreLoader />
          ) : (
            <>
              <Header />
              {children}
              <CartSidebarModal />
              <PreviewSliderModal />
            </>
          )}
          <CartLoader />
          <ScrollToTop />
          <Footer />
        </PreviewSliderProvider>
      </ModalProvider>
    </CartModalProvider>
  );
}
