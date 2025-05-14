"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeItemFromCart,
  updateCartItemQuantity,
  selectTotalPrice,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import Image from "next/image";

const SingleItem = ({ item }) => {
  const dispatch = useDispatch();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
  };

  const handleIncreaseQuantity = () => {
    dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  return (
    <div className="flex items-center border-t border-gray-3 py-5 px-7.5">
      <div className="min-w-[400px]">
        <div className="flex items-center justify-between gap-5">
          <div className="w-full flex items-center gap-5.5">
            <div className="flex items-center justify-center rounded-[5px] bg-gray-2 max-w-[80px] w-full h-17.5">
              <Image width={80} height={80} src={item.imageUrl} alt="product" />
            </div>
            <div>
              <h3 className="text-dark ease-out duration-200 hover:text-blue">
                <a href="#">{item.name}</a>
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="min-w-[180px]">
        <p className="text-dark">₹{item.price}</p>
      </div>

      <div className="min-w-[275px]">
        <div className="w-max flex items-center rounded-md border border-gray-3">
          <button
            onClick={handleDecreaseQuantity}
            className="flex items-center justify-center w-11.5 h-11.5 hover:text-blue"
          >
            –
          </button>
          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4">
            {item.quantity}
          </span>
          <button
            onClick={handleIncreaseQuantity}
            className="flex items-center justify-center w-11.5 h-11.5 hover:text-blue"
          >
            +
          </button>
        </div>
      </div>

      <div className="min-w-[200px]">
        <p className="text-dark">₹{item.discountedPrice * item.quantity}</p>
      </div>

      <div className="min-w-[50px] flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          className="rounded-lg max-w-[38px] h-9.5 bg-gray-2 border border-gray-3 text-dark hover:bg-red-100 hover:text-red"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  const handleNavigate = (path: string) => {
    closeCartModal();
    setTimeout(() => {
      router.push(path);
    }, 100);
  };

  return (
    <div
      className={`fixed top-0 left-0 z-50 w-full h-screen bg-black/60 transition-all ${
        isCartModalOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex justify-end h-full">
        <div className="w-full max-w-[500px] bg-white p-5 shadow-lg relative modal-content">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h2 className="text-2xl font-semibold">Cart</h2>
            <button onClick={closeCartModal} className="text-xl">
              ✕
            </button>
          </div>

          <div className="h-[60vh] overflow-y-auto">
            {cartItems.length ? (
              cartItems.map((item) => <SingleItem key={item._id} item={item} />)
            ) : (
              <p className="text-center text-gray-500 py-10">Your cart is empty.</p>
            )}
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between text-lg font-medium mb-4">
              <span>Subtotal:</span>
              <span>₹{totalPrice}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleNavigate("/cart")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md"
              >
                View Cart
              </button>
              <button
                onClick={() => handleNavigate("/checkout")}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-2 rounded-md"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
