"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { setUser } from "../../redux/features/auth-slice"; // Assuming this is the correct path

// Define ApiOrder and CartItem interfaces
interface CartItem { // Basic definition, expand if needed
  name: string;
  quantity: number; // Add quantity to CartItem
  // Add other properties like price from your Invoice model if used
}

interface ApiOrder {
  _id: string;
  createdAt: string;
  orderStatus?: string | null;
  grandTotal?: number | null;
  cartItems?: CartItem[];
  // Add any other properties your API returns for an order
}

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userOrders, setUserOrders] = useState<ApiOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [totalProductsBought, setTotalProductsBought] = useState<number>(0); // New state for total products

  // Extend userData type to include createdAt as optional
  type UserData = {
    _id: string;
    name: string;
    email: string;
    createdAt?: string;
  };
  const userData = useSelector((state: RootState) => state.authReducer.user) as UserData;

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem("yourAuthTokenKey");

      if (!token) {
        setOrderError("Please log in to view dashboard details.");
        setIsLoadingOrders(false);
        return;
      }

      try {
        const response = await fetch('https://estore-backend-dyl3.onrender.com/api/invoice/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized access. Please log in again.");
          }
          throw new Error(`Failed to fetch orders. Status: ${response.status}`);
        }
        const data = await response.json();
        const rawOrders: ApiOrder[] = Array.isArray(data) ? data : data.orders || [];
        setUserOrders(rawOrders);
      } catch (err: any) {
        setOrderError(err.message || "An unknown error occurred while fetching orders.");
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (userOrders && userOrders.length > 0) {
      const count = userOrders.length;
      const spent = userOrders.reduce((acc, order) => {
        const orderTotal = order.grandTotal || 0; // Default to 0 if grandTotal is null/undefined
        return acc + orderTotal;
      }, 0);

      // Calculate total products bought
      const productsCount = userOrders.reduce((acc, order) => {
        const orderProducts = order.cartItems?.reduce((itemAcc, item) => itemAcc + (item.quantity || 0), 0) || 0;
        return acc + orderProducts;
      }, 0);

      setTotalOrdersCount(count);
      setTotalSpent(spent);
      setTotalProductsBought(productsCount); // Set the new state
    } else {
      // If there are no orders, reset all totals to 0
      setTotalOrdersCount(0);
      setTotalSpent(0);
      setTotalProductsBought(0);
    }
  }, [userOrders]); // Dependency array: recalculate when userOrders changes

  const [addressModal, setAddressModal] = useState(false);

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* */}
            <div className="xl:max-w-[370px] w-full bg-white rounded-xl shadow-1">
              <div className="flex xl:flex-col">
                <div className="hidden lg:flex flex-wrap items-center gap-5 py-6 px-4 sm:px-7.5 xl:px-9 border-r xl:border-r-0 xl:border-b border-gray-3">
                  <div className="max-w-[64px] w-full h-16 rounded-full overflow-hidden">
                    <Image
                      src="/images/users/user-04.jpg"
                      alt="user"
                      width={64}
                      height={64}
                    />
                  </div>

                  <div>
                    <p className="font-medium text-dark mb-0.5">
                      {userData?.name || "User Name"}
                    </p>
                    <p className="text-custom-xs">
                      {userData?.createdAt ?
                        `Member Since ${new Date(userData.createdAt).toLocaleDateString('en-GB', {
                          month: 'short',
                          year: 'numeric',
                        })}`
                        : "Member since N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-4 sm:p-7.5 xl:p-9">
                  <div className="flex flex-wrap xl:flex-nowrap xl:flex-col gap-4">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "dashboard"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.91002 1.60413C5.08642 1.6041 4.39962 1.60408 3.85441 1.67738C3.27893 1.75475 2.75937 1.92495 2.34185 2.34246C1.92434 2.75998 1.75414 3.27954 1.67677 3.85502C1.60347 4.40023 1.60349 5.08701 1.60352 5.9106V6.00596C1.60349 6.82956 1.60347 7.51636 1.67677 8.06157C1.75414 8.63705 1.92434 9.15661 2.34185 9.57413C2.75937 9.99164 3.27893 10.1618 3.85441 10.2392C4.39962 10.3125 5.0864 10.3125 5.90999 10.3125H6.00535C6.82894 10.3125 7.51575 10.3125 8.06096 10.2392C8.63644 10.1618 9.156 9.99164 9.57352 9.57413C9.99103 9.15661 10.1612 8.63705 10.2386 8.06157C10.3119 7.51636 10.3119 6.82958 10.3119 6.00599V5.91063C10.3119 5.08704 10.3119 4.40023 10.2386 3.85502C10.1612 3.27954 9.99103 2.75998 9.57352 2.34246C9.156 1.92495 8.63644 1.75475 8.06096 1.67738C7.51575 1.60408 6.82897 1.6041 6.00538 1.60413H5.91002ZM3.31413 3.31474C3.43358 3.19528 3.61462 3.09699 4.03763 3.04012C4.48041 2.98059 5.07401 2.97913 5.95768 2.97913C6.84136 2.97913 7.43496 2.98059 7.87774 3.04012C8.30075 3.09699 8.48179 3.19528 8.60124 3.31474C8.7207 3.43419 8.81899 3.61523 8.87586 4.03824C8.93539 4.48102 8.93685 5.07462 8.93685 5.9583C8.93685 6.84197 8.93539 7.43557 8.87586 7.87835C8.81899 8.30136 8.7207 8.4824 8.60124 8.60186C8.48179 8.72131 8.30075 8.8196 7.87774 8.87647C7.43496 8.936 6.84136 8.93746 5.95768 8.93746C5.07401 8.93746 4.48041 8.936 4.03763 8.87647C3.61462 8.8196 3.43358 8.72131 3.31413 8.60186C3.19467 8.4824 3.09638 8.30136 3.03951 7.87835C2.97998 7.43557 2.97852 6.84197 2.97852 5.9583C2.97852 5.07462 2.97998 4.48102 3.03951 4.03824C3.09638 3.61523 3.19467 3.43419 3.31413 3.31474Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.9934 11.6875C15.1697 11.6874 14.483 11.6874 13.9377 11.7607C13.3623 11.8381 12.8427 12.0083 12.4252 12.4258C12.0077 12.8433 11.8375 13.3629 11.7601 13.9384C11.6868 14.4836 11.6868 15.1704 11.6869 15.994V16.0893C11.6868 16.9129 11.6868 17.5997 11.7601 18.1449C11.8375 18.7204 12.0077 19.2399 12.4252 19.6575C12.8427 20.075 13.3623 20.2452 13.9377 20.3225C14.4829 20.3958 15.1697 20.3958 15.9933 20.3958H16.0887C16.9123 20.3958 17.5991 20.3958 18.1443 20.3225C18.7198 20.2452 19.2393 20.075 19.6569 19.6575C20.0744 19.2399 20.2446 18.7204 20.3219 18.1449C20.3952 17.5997 20.3952 16.913 20.3952 16.0894V15.994C20.3952 15.1704 20.3952 14.4836 20.3219 13.9384C20.2446 13.3629 20.0744 12.8433 19.6569 12.4258C19.2393 12.0083 18.7198 11.8381 18.1443 11.7607C17.5991 11.6874 16.9123 11.6874 16.0887 11.6875H15.9934ZM13.3975 13.3981C13.5169 13.2786 13.698 13.1803 14.121 13.1235C14.5637 13.0639 15.1573 13.0625 16.041 13.0625C16.9247 13.0625 17.5183 13.0639 17.9611 13.1235C18.3841 13.1803 18.5651 13.2786 18.6846 13.3981C18.804 13.5175 18.9023 13.6986 18.9592 14.1216C19.0187 14.5644 19.0202 15.158 19.0202 16.0416C19.0202 16.9253 19.0187 17.5189 18.9592 17.9617C18.9023 18.3847 18.804 18.5657 18.6846 18.6852C18.5651 18.8046 18.3841 18.9029 17.9611 18.9598C17.5183 19.0193 16.9247 19.0208 16.041 19.0208C15.1573 19.0208 14.5637 19.0193 14.121 18.9598C13.698 18.9029 13.5169 18.8046 13.3975 18.6852C13.278 18.5657 13.1797 18.3847 13.1228 17.9617C13.0633 17.5189 13.0619 16.9253 13.0619 16.0416C13.0619 15.158 13.0633 14.5644 13.1228 14.1216C13.1797 13.6986 13.278 13.5175 13.3975 13.3981Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.91002 11.6875H6.00535C6.82896 11.6874 7.51574 11.6874 8.06096 11.7607C8.63644 11.8381 9.156 12.0083 9.57352 12.4258C9.99103 12.8433 10.1612 13.3629 10.2386 13.9384C10.3119 14.4836 10.3119 15.1703 10.3119 15.9939V16.0893C10.3119 16.9129 10.3119 17.5997 10.2386 18.1449C10.1612 18.7204 9.99103 19.2399 9.57352 19.6575C9.156 20.075 8.63644 20.2452 8.06096 20.3225C7.51575 20.3958 6.82899 20.3958 6.0054 20.3958H5.91002C5.08644 20.3958 4.39962 20.3958 3.85441 20.3225C3.27893 20.2452 2.75937 20.075 2.34185 19.6575C1.92434 19.2399 1.75414 18.7204 1.67677 18.1449C1.60347 17.5997 1.60349 16.9129 1.60352 16.0893V15.994C1.60349 15.1704 1.60347 14.4836 1.67677 13.9384C1.75414 13.3629 1.92434 12.8433 2.34185 12.4258C2.75937 12.0083 3.27893 11.8381 3.85441 11.7607C4.39963 11.6874 5.08641 11.6874 5.91002 11.6875ZM4.03763 13.1235C3.61462 13.1803 3.43358 13.2786 3.31413 13.3981C3.19467 13.5175 3.09638 13.6986 3.03951 14.1216C2.97998 14.5644 2.97852 15.158 2.97852 16.0416C2.97852 16.9253 2.97998 17.5189 3.03951 17.9617C3.09638 18.3847 3.19467 18.5657 3.31413 18.6852C3.43358 18.8046 3.61462 18.9029 4.03763 18.9598C4.48041 19.0193 5.07401 19.0208 5.95768 19.0208C6.84136 19.0208 7.43496 19.0193 7.87774 18.9598C8.30075 18.9029 8.48179 18.8046 8.60124 18.6852C8.7207 18.5657 8.81899 18.3847 8.87586 17.9617C8.93539 17.5189 8.93685 16.9253 8.93685 16.0416C8.93685 15.158 8.93539 14.5644 8.87586 14.1216C8.81899 13.6986 8.7207 13.5175 8.60124 13.3981C8.48179 13.2786 8.30075 13.1803 7.87774 13.1235C7.43496 13.0639 6.84136 13.0625 5.95768 13.0625C5.07401 13.0625 4.48041 13.0639 4.03763 13.1235Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.9934 1.60413C15.1698 1.6041 14.483 1.60408 13.9377 1.67738C13.3623 1.75475 12.8427 1.92495 12.4252 2.34246C12.0077 2.75998 11.8375 3.27954 11.7601 3.85502C11.6868 4.40024 11.6868 5.08702 11.6869 5.91063V6.00596C11.6868 6.82957 11.6868 7.51635 11.7601 8.06157C11.8375 8.63705 12.0077 9.15661 12.4252 9.57413C12.8427 9.99164 13.3623 10.1618 13.9377 10.2392C14.483 10.3125 15.1697 10.3125 15.9933 10.3125H16.0887C16.9123 10.3125 17.5991 10.3125 18.1443 10.2392C18.7198 10.1618 19.2393 9.99164 19.6569 9.57413C20.0744 9.15661 20.2446 8.63705 20.3219 8.06157C20.3952 7.51636 20.3952 6.82958 20.3952 6.00599V5.91063C20.3952 5.08704 20.3952 4.40023 20.3219 3.85502C20.2446 3.27954 20.0744 2.75998 19.6569 2.34246C19.2393 1.92495 18.7198 1.75475 18.1443 1.67738C17.5991 1.60408 16.9123 1.6041 16.0887 1.60413H15.9934ZM13.3975 3.31474C13.5169 3.19528 13.698 3.09699 14.121 3.04012C14.5637 2.98059 15.1573 2.97913 16.041 3.0625C16.9247 3.0625 17.5183 3.0639 17.9611 3.1235C18.3841 3.1803 18.5651 3.2786 18.6846 3.3981C18.804 3.5175 18.9023 3.6986 18.9592 4.1216C19.0187 4.5644 19.0202 5.158 19.0202 6.0416C19.0202 6.9253 19.0187 7.5189 18.9592 7.9617C18.9023 8.3847 18.804 8.5657 18.6846 8.6852C18.5651 8.8046 18.3841 8.9029 17.9611 8.9598C17.5183 9.0193 16.9247 9.0208 16.041 9.0208C15.1573 9.0208 14.5637 9.0193 14.121 8.9598C13.698 8.9029 13.5169 8.8046 13.3975 8.6852C13.278 8.5657 13.1797 8.3847 13.1228 7.9617C13.0633 7.5189 13.0619 6.9253 13.0619 6.0416C13.0619 5.158 13.0633 4.5644 13.1228 4.1216C13.1797 3.6986 13.278 3.5175 13.3975 3.3981Z"
                          fill=""
                        />
                      </svg>
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "orders"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.0203 11.9167C8.0203 11.537 7.71249 11.2292 7.3328 11.2292C6.9531 11.2292 6.6453 11.537 6.6453 11.9167V15.5833C6.6453 15.963 6.9531 16.2708 7.3328 16.2708C7.71249 16.2708 8.0203 15.963 8.0203 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          d="M14.6661 11.2292C15.0458 11.2292 15.3536 11.537 15.3536 11.9167V15.5833C15.3536 15.963 15.0458 16.2708 14.6661 16.2708C14.2864 16.2708 13.9786 15.963 13.9786 15.5833V11.9167C13.9786 11.537 14.2864 11.2292 14.6661 11.2292Z"
                          fill=""
                        />
                        <path
                          d="M11.687 11.9167C11.687 11.537 11.3792 11.2292 10.9995 11.2292C10.6198 11.2292 10.312 11.537 10.312 11.9167V15.5833C10.312 15.963 10.6198 16.2708 10.9995 16.2708C11.3792 16.2708 11.687 15.963 11.687 15.5833V11.9167Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.8338 3.18356C15.3979 3.01319 14.9095 2.98443 14.2829 2.97987C14.0256 2.43753 13.473 2.0625 12.8328 2.0625H9.16613C8.52593 2.0625 7.97332 2.43753 7.716 2.97987C7.08942 2.98443 6.60107 3.01319 6.16515 3.18356C5.64432 3.38713 5.19129 3.73317 4.85788 4.18211C4.52153 4.63502 4.36363 5.21554 4.14631 6.01456L3.57076 8.12557C3.21555 8.30747 2.90473 8.55242 2.64544 8.88452C2.07527 9.61477 1.9743 10.4845 2.07573 11.4822C2.17415 12.4504 2.47894 13.6695 2.86047 15.1955L2.88467 15.2923C3.12592 16.2573 3.32179 17.0409 3.55475 17.6524C3.79764 18.2899 4.10601 18.8125 4.61441 19.2095C5.12282 19.6064 5.70456 19.7788 6.38199 19.8598C7.03174 19.9375 7.8394 19.9375 8.83415 19.9375H13.1647C14.1594 19.9375 14.9671 19.9375 15.6169 19.8598C16.2943 19.7788 16.876 19.6064 17.3844 19.2095C17.8928 18.8125 18.2012 18.2899 18.4441 17.6524C18.6771 17.0409 18.8729 16.2573 19.1142 15.2923L19.1384 15.1956C19.5199 13.6695 19.8247 12.4504 19.9231 11.4822C20.0245 10.4845 19.9236 9.61477 19.3534 8.88452C19.0941 8.55245 18.7833 8.30751 18.4282 8.12562L17.8526 6.01455C17.6353 5.21554 17.4774 4.63502 17.141 4.18211C16.8076 3.73317 16.3546 3.38713 15.8338 3.18356ZM6.66568 4.46423C6.86717 4.38548 7.11061 4.36231 7.71729 4.35618C7.97516 4.89706 8.527 5.27083 9.16613 5.27083H12.8328C13.4719 5.27083 14.0238 4.89706 14.2816 4.35618C14.8883 4.36231 15.1318 4.38548 15.3332 4.46423C15.6137 4.57384 15.8576 4.76017 16.0372 5.00191C16.1986 5.21928 16.2933 5.52299 16.56 6.50095L16.8841 7.68964C15.9328 7.56246 14.7046 7.56248 13.1787 7.5625H8.82014C7.29428 7.56248 6.06614 7.56246 5.11483 7.68963L5.43894 6.50095C5.7056 5.52299 5.80033 5.21928 5.96176 5.00191C6.14129 4.76017 6.38523 4.57384 6.66568 4.46423ZM9.16613 3.4375C9.03956 3.4375 8.93696 3.5401 8.93696 3.66667C8.93696 3.79323 9.03956 3.89583 9.16613 3.89583H12.8328C12.9594 3.89583 13.062 3.79323 13.062 3.66667C13.062 3.5401 12.9594 3.4375 12.8328 3.4375H9.16613ZM3.72922 9.73071C3.98482 9.40334 4.38904 9.18345 5.22428 9.06262C6.07737 8.93921 7.23405 8.9375 8.87703 8.9375H13.1218C14.7648 8.9375 15.9215 8.93921 16.7746 9.06262C17.6098 9.18345 18.014 9.40334 18.2696 9.73071C18.5252 10.0581 18.6405 10.5036 18.5552 11.3432C18.468 12.2007 18.1891 13.3233 17.7906 14.9172C17.5365 15.9338 17.3595 16.6372 17.1592 17.1629C16.9655 17.6713 16.7758 17.9402 16.5382 18.1257C16.3007 18.3112 15.9938 18.43 15.4536 18.4946C14.895 18.5614 14.1697 18.5625 13.1218 18.5625H8.87703C7.8291 18.5625 7.10386 18.5614 6.54525 18.4946C6.005 18.43 5.69817 18.3112 5.4606 18.1257C5.22304 17.9402 5.03337 17.6713 4.83967 17.1629C4.63938 16.6372 4.46237 15.9338 4.20822 14.9172C3.80973 13.3233 3.53086 12.2007 3.44368 11.3432C3.35832 10.5036 3.47362 10.0581 3.72922 9.73071Z"
                          fill=""
                        />
                      </svg>
                      Orders
                    </button>


                    <button
                      onClick={() => setActiveTab("logout")}
                      className={`flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white ${
                        activeTab === "logout"
                          ? "text-white bg-blue"
                          : "text-dark-2 bg-gray-1"
                      }`}
                    >
                      <svg
                        className="fill-current"
                        width="22"
                        height="22"
                        viewBox="0 0 22 22"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M13.7005 1.14581C12.4469 1.14579 11.4365 1.14578 10.6417 1.25263C9.81664 1.36356 9.12193 1.60088 8.57017 2.15263C8.08898 2.63382 7.84585 3.22514 7.71822 3.91997C7.59419 4.59515 7.57047 5.42142 7.56495 6.41282C7.56284 6.79251 7.86892 7.10202 8.24861 7.10414C8.6283 7.10625 8.93782 6.80016 8.93993 6.42047C8.94551 5.4181 8.97154 4.70761 9.07059 4.16838C9.16603 3.64881 9.31927 3.34807 9.54244 3.12491C9.79614 2.87121 10.1523 2.7058 10.825 2.61537C11.5174 2.52227 12.435 2.52081 13.7508 2.52081H14.6675C15.9833 2.52081 16.901 2.52227 17.5934 2.61537C18.266 2.7058 18.6222 2.87121 18.8759 3.12491C19.1296 3.37861 19.295 3.7348 19.3855 4.40742C19.4786 5.09983 19.48 6.01752 19.48 7.33331V14.6666C19.48 15.9824 19.4786 16.9001 19.3855 17.5925C19.295 18.2652 19.1296 18.6214 18.8759 18.8751C18.6222 19.1288 18.266 19.2942 17.5934 19.3846C16.901 19.4777 15.9833 19.4791 14.6675 19.4791H13.7508C12.435 19.4791 11.5174 19.4777 10.825 19.3846C10.1523 19.2942 9.79614 19.1288 9.54244 18.8751C9.31927 18.6519 9.16603 18.3512 9.07059 17.8316C8.97154 17.2924 8.94551 16.5819 8.93993 15.5795C8.93782 15.1998 8.6283 14.8937 8.24861 14.8958C7.86892 14.8979 7.56284 15.2075 7.56495 15.5871C7.57047 16.5785 7.59419 17.4048 7.71822 18.08C7.84585 18.7748 8.08898 19.3661 8.57017 19.8473C9.12193 20.3991 9.81664 20.6364 10.6417 20.7473C11.4365 20.8542 12.4469 20.8542 13.7006 20.8541H14.7178C15.9714 20.8542 16.9819 20.8542 17.7766 20.7473C18.6017 20.6364 19.2964 20.3991 19.8482 19.8473C20.4 19.2956 20.6373 18.6009 20.7482 17.7758C20.855 16.981 20.855 15.9706 20.855 14.7169V7.28302C20.855 6.02939 20.855 5.01893 20.7482 4.22421C20.6373 3.39911 20.4 2.70439 19.8482 2.15263C19.2964 1.60088 18.6017 1.36356 17.7766 1.25263C16.9819 1.14578 15.9714 1.14579 14.7178 1.14581H13.7005Z"
                          fill=""
                        />
                        <path
                          d="M13.7507 10.3125C14.1303 10.3125 14.4382 10.6203 14.4382 11C14.4382 11.3797 14.1303 11.6875 13.7507 11.6875H3.69247L5.48974 13.228C5.77802 13.4751 5.81141 13.9091 5.56431 14.1974C5.3172 14.4857 4.88318 14.5191 4.5949 14.272L1.38657 11.522C1.23418 11.3914 1.14648 11.2007 1.14648 11C1.14648 10.7993 1.23418 10.6086 1.38657 10.478L4.5949 7.72799C4.88318 7.48089 5.3172 7.51428 5.56431 7.80256C5.81141 8.09085 5.77802 8.52487 5.48974 8.77197L3.69247 10.3125H13.7507Z"
                          fill=""
                        />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* */}
            {/* */}

            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 py-9.5 px-4 sm:px-7.5 xl:px-10 ${
                activeTab === "dashboard" ? "block" : "hidden"
              }`}
            >
              <p className="text-dark">
                Hello {userData?.name || "User"} (not {userData?.name || "User"}?{" "}
                <button onClick={() => setActiveTab("logout")} className="text-red ease-out duration-200 hover:underline">
                  Log Out
                </button>
                )
              </p>

              <p className="text-custom-sm mt-4">
                From your account dashboard you can view your recent orders, manage your
                shipping and billing addresses, edit your password and account details,
                and see a summary of your activity.
              </p>

              {/* Dashboard Stats Section */}
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-semibold text-dark">Your Activity</h2>
                {isLoadingOrders ? (
                  <p className="text-custom-sm">Loading your activity summary...</p>
                ) : orderError ? (
                  <p className="text-custom-sm text-red">Error loading activity: {orderError}</p>
                ) : (
                  <>
                    <div>
                      <p className="text-custom-sm text-dark-2">Total Orders:</p>
                      <p className="text-lg font-medium text-dark">{totalOrdersCount}</p>
                    </div>
                    <div>
                      <p className="text-custom-sm text-dark-2">Total Spent:</p>
                      <p className="text-lg font-medium text-dark">
                        ₹{totalSpent.toFixed(2)}
                      </p>
                    </div>
                    {/* Display Total Products Bought */}
                    <div>
                      <p className="text-custom-sm text-dark-2">Total Products Bought:</p>
                      <p className="text-lg font-medium text-dark">{totalProductsBought}</p>
                    </div>
                    {userOrders.length === 0 && !orderError && (
                      <p className="text-custom-sm text-dark-2">You haven't placed any orders yet.</p>
                    )}
                  </>
                )}
              </div>
            </div>
            {/* */}
            <div
              className={`xl:max-w-[770px] w-full bg-white rounded-xl shadow-1 ${
                activeTab === "orders" ? "block" : "hidden"
              }`}
            >
              <Orders />
            </div>
            
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;