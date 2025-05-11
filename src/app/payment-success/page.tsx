"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import Breadcrumb from "../../components/Common/Breadcrumb";
import Link from "next/link";

const PaymentSuccess = ({ invoiceNumber, grandTotal }: { invoiceNumber: string; grandTotal: number }) => {
  const router = useRouter();

  useEffect(() => {
    // Clear cart or perform other success actions here
  }, []);

  return (
    <>
      <Breadcrumb title={"Order Confirmed"} pages={["checkout", "success"]} />
      
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Animated Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 mb-8"
          >
            <svg
              className="h-16 w-16 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8"
          >
            Thank you for your order. Your package is being prepared for shipment.
          </motion.p>

          {/* Delivery Animation - Using CDN URL */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="max-w-md mx-auto mb-12"
          >
            <Lottie 
              animationData="https://assets5.lottiefiles.com/packages/lf20_gsa6rswk.json" 
              loop={true}
              style={{ height: 300 }}
            />
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto text-left border border-blue-100"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 border-blue-50">
              Order Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Paid:</span>
                <span className="font-medium text-blue-600">₹{grandTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">Payment Confirmed</span>
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link
              href="/orders"
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              View Your Orders
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-gray-50 transition-colors border border-blue-600 shadow-md"
            >
              Continue Shopping
            </Link>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12 pt-6 border-t border-gray-200"
          >
            <p className="text-gray-500 mb-2">Need help with your order?</p>
            <a
              href="mailto:support@estore.com"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Contact our customer support
            </a>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;