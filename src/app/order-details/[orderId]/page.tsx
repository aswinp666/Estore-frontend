// src/app/order-details/[orderId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image'; 

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string; 
  productId?: string; 
}

interface OrderDetailsData {
  _id: string;
  createdAt: string;
  orderStatus: string;
  grandTotal: number;
  cartItems: CartItem[];
}

type OrderDetailsPageProps = {
  params: { orderId: string };
};

const returnReasons = [
  "Damaged item",
  "Wrong size/item",
  "No longer needed",
  "Arrived too late",
  "Item not as described",
  "Other",
];

const OrderDetailsPage = ({ params }: OrderDetailsPageProps) => {
  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [returningProductId, setReturningProductId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<{ [productId: string]: string }>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const urlsToTry = [
        `https://estore-backend-dyl3.onrender.com/api/invoice/my-orders/${params.orderId}`,
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${params.orderId}`,
        `https://estore-backend-dyl3.onrender.com/api/invoices/${params.orderId}`
      ];

      let data: OrderDetailsData | null = null;
      let responseOk = false;

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            data = await response.json();
            if (data && (data as any).order) {
                data = (data as any).order;
            } else if (data && (data as any).invoice) {
                data = (data as any).invoice;
            }
            responseOk = true;
            break;
          } else if (response.status === 404) {
            console.warn(`Order not found at ${url}`);
          } else {
            const errorData = await response.json();
            console.error(`Error fetching from ${url}:`, errorData);
          }
        } catch (err) {
          console.error(`Network error or JSON parsing error from ${url}:`, err);
        }
      }

      if (responseOk && data) {
        setOrderDetails(data);
      } else {
        setError("Failed to fetch order details. Please check the order ID or try again later.");
      }
      setLoading(false);
    };

    if (params.orderId) {
      fetchOrderDetails();
    }
  }, [params.orderId]);

  const handleReturnClick = (productId: string) => {
    setReturningProductId(productId);
    setSelectedReason(''); 
    setReturnDetails(''); 
  };

  const handleCancelReturn = () => {
    setReturningProductId(null);
    setSelectedReason(''); 
    setReturnDetails(''); 
  };

  const handleSubmitReturn = (productId: string) => {
    if (!returningProductId) return;

    console.log("Return Request:", { 
      orderId: params.orderId,
      productId: returningProductId, 
      reason: selectedReason, 
      details: returnDetails 
    });
    
    setSubmissionStatus(prevStatus => ({
      ...prevStatus,
      [returningProductId]: "Return requested successfully! You will be contacted regarding your request." 
    }));
    
    setReturningProductId(null); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-700">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-red-600 bg-red-100 p-6 rounded-md shadow-md">Error: {error}</div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg font-semibold text-gray-700">No order details found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl"> {/* Added max-width for better readability on large screens */}
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Order Details</h1>
      
      <div className="bg-white shadow-xl rounded-lg p-6 sm:p-8 mb-8"> {/* Increased shadow and padding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <p className="text-gray-700"><strong className="font-semibold text-gray-900">Order ID:</strong> {orderDetails._id}</p>
            <p className="text-gray-700"><strong className="font-semibold text-gray-900">Order Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
            <p className="text-gray-700">
              <strong className="font-semibold text-gray-900">Order Status:</strong> 
              <span className={`ml-2 capitalize px-3 py-1 text-sm font-semibold rounded-full ${
                orderDetails.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                orderDetails.orderStatus === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                orderDetails.orderStatus === 'on-hold' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>{orderDetails.orderStatus}</span>
            </p>
            <p className="text-xl font-bold text-gray-800 md:col-span-2 mt-2"><strong className="font-semibold text-gray-900">Order Total:</strong> ${orderDetails.grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-10"> {/* Increased top margin */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Products in this Order</h2>
        {orderDetails.cartItems && orderDetails.cartItems.length > 0 ? (
          <ul className="space-y-8"> {/* Increased spacing */}
            {orderDetails.cartItems.map((item) => (
              <li key={item._id} className="p-6 bg-white shadow-xl rounded-lg"> {/* Increased shadow and padding */}
                <div className="flex flex-col md:flex-row items-start">
                  {item.image && (
                    <div className="w-full md:w-32 h-32 relative mr-0 md:mr-6 mb-4 md:mb-0 flex-shrink-0 rounded-md overflow-hidden"> {/* Ensure rounded corners apply */}
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        layout="fill" 
                        objectFit="cover" 
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-800 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-sm text-gray-600">Price per item: ${item.price.toFixed(2)}</p>
                    <p className="text-md font-semibold text-gray-700 mt-2">Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-auto flex-shrink-0 self-start md:self-center">
                    {!submissionStatus[item._id] ? (
                      <button
                        onClick={() => handleReturnClick(item._id)}
                        disabled={!!returningProductId && returningProductId !== item._id} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        Return This Product
                      </button>
                    ) : (
                      <span className="text-sm font-semibold text-green-600">
                        Return Requested
                      </span>
                    )}
                  </div>
                </div>

                {submissionStatus[item._id] && returningProductId !== item._id && (
                  <p className="mt-3 text-sm text-green-600 bg-green-50 p-3 rounded-md">{submissionStatus[item._id]}</p>
                )}

                {returningProductId === item._id && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-lg font-semibold mb-4 text-gray-700">Return Reason for: <span className="font-bold">{item.name}</span></h4>
                    <div className="space-y-3 mb-4"> {/* Increased spacing for radio buttons */}
                      {returnReasons.map((reason) => (
                        <label key={reason} className="flex items-center text-sm text-gray-700 cursor-pointer">
                          <input
                            type="radio"
                            name={`returnReason-${item._id}`}
                            value={reason}
                            checked={selectedReason === reason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                          />
                          {reason}
                        </label>
                      ))}
                    </div>
                    <textarea
                      placeholder="Provide more details (optional)"
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm shadow-sm"
                      rows={4} 
                    ></textarea>
                    <div className="mt-5 flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0"> {/* Responsive button layout */}
                      <button
                        onClick={() => handleSubmitReturn(item._id)}
                        disabled={!selectedReason}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-md text-sm disabled:opacity-60 transition duration-150 ease-in-out shadow-sm"
                      >
                        Submit Return Request
                      </button>
                      <button
                        onClick={handleCancelReturn}
                        className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-md text-sm transition duration-150 ease-in-out shadow-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-center py-5">No products found in this order.</p>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;
