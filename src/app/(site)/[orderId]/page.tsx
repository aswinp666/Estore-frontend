// src/app/(site)/order-details/[orderId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface CartItem {
  _id: string; // This is the unique ID of the item within the cart/order
  name: string;
  price: number;
  quantity: number;
  image?: string;
  productId?: string; // ID of the product from the Product model
  // New fields for return tracking
  returnStatus?: "NotReturned" | "ReturnRequested" | "Returned" | "ReturnRejected";
  returnReason?: string;
  returnDetails?: string;
}

interface OrderDetailsData {
  _id: string;
  createdAt: string;
  orderStatus: string;
  grandTotal: number;
  cartItems: CartItem[];
  billingData?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
}

const returnReasons = [
  "Damaged item",
  "Wrong size/item",
  "No longer needed",
  "Arrived too late",
  "Item not as described",
  "Other",
];

const OrderDetailsPage = () => {
  const params = useParams();
  const orderIdParam = params?.orderId;
  const orderId = typeof orderIdParam === 'string' ? orderIdParam : Array.isArray(orderIdParam) ? orderIdParam[0] : null;

  console.log("RENDER: OrderDetailsPage component. Order ID from URL:", orderId); // LOG 1

  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [returningProductId, setReturningProductId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<{ [cartItemId: string]: string }>({});

  // LOG 2: See returningProductId state on every render
  console.log("RENDER: Current returningProductId state:", returningProductId);


  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        console.warn("FETCH: No orderId available. Skipping fetch."); // LOG 3
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const token = localStorage.getItem("yourAuthTokenKey");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const urlsToTry = [
        `https://estore-backend-dyl3.onrender.com/api/invoice/${orderId}`,
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}`,
      ];

      let data: OrderDetailsData | null = null;
      let responseOk = false;
      let attemptedUrl = '';

      for (const url of urlsToTry) {
        attemptedUrl = url;
        console.log("FETCH: Attempting to fetch order details from:", url); // LOG 4
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const responseData = await response.json();
            if (responseData && typeof responseData === 'object') {
                if (responseData.order && typeof responseData.order === 'object') {
                    data = responseData.order;
                } else if (responseData.invoice && typeof responseData.invoice === 'object') {
                    data = responseData.invoice;
                } else if (responseData._id) {
                    data = responseData;
                }
            }
            if(data && data._id === orderId) {
                responseOk = true;
                break;
            } else {
                console.warn(`Workspace: Fetched data ID mismatch or invalid structure for URL: ${url}`);
                data = null;
            }
          } else {
            console.error(`Workspace: Failed from ${url} with status: ${response.status}, response text: ${await response.text()}`); // LOG 5
          }
        } catch (err) {
          console.error(`Workspace: Error fetching order details from ${url}:`, err); // LOG 6
        }
      }

      if (responseOk && data) {
        setOrderDetails(data);
        console.log("FETCH: Order details loaded successfully:", data); // LOG 7
        // Add log to check the first item's _id if data is loaded
        if (data.cartItems && data.cartItems.length > 0) {
            console.log("FETCH: First cart item in data (full object):", data.cartItems[0]); // NEW LOG 7a
            console.log("FETCH: First cart item _id (extracted from data):", data.cartItems[0]._id); // NEW LOG 7b
        } else {
            console.warn("FETCH: No cart items found in order data or cartItems array is empty."); // NEW LOG for empty cart
        }
      } else {
        setError(`Failed to fetch order details for Order ID: ${orderId}. Please check the Order ID or try again later.`);
        console.error(`Workspace: Failed from all attempted URLs. Last attempt: ${attemptedUrl}`); // LOG 8
      }
      setLoading(false);
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleReturnClick = (cartItemId: string) => {
    console.log("HANDLE_RETURN_CLICK: Button clicked for cartItemId:", cartItemId); // LOG 9
    setReturningProductId(cartItemId);
    console.log("HANDLE_RETURN_CLICK: returningProductId state set to:", cartItemId); // LOG 10
    setSelectedReason('');
    setReturnDetails('');
    setSubmissionStatus(prev => ({ ...prev, [cartItemId]: '' }));
  };

  const handleCancelReturn = () => {
    console.log("CANCEL_RETURN: Cancelling return request."); // LOG 11
    if (returningProductId) {
        setSubmissionStatus(prev => ({ ...prev, [returningProductId]: '' }));
    }
    setReturningProductId(null);
    setSelectedReason('');
    setReturnDetails('');
  };

  const handleSubmitReturn = async () => {
    const currentCartItemId = returningProductId;

    console.log("HANDLE_SUBMIT_RETURN: Function called. Checking data..."); // LOG 12
    console.log("HANDLE_SUBMIT_RETURN: currentCartItemId:", currentCartItemId, "orderId:", orderId); // LOG 13

    if (!currentCartItemId || !orderId) {
        setSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId || 'unknown']: "Submission error: Product or Order ID missing. Check console.",
        }));
        console.error("ERROR: handleSubmitReturn - Missing currentCartItemId or orderId.", { currentCartItemId, orderId }); // LOG 14
        return;
    }

    if (!selectedReason) {
        setSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId]: "Please select a return reason.",
        }));
        console.warn("WARNING: handleSubmitReturn - No return reason selected."); // LOG 15
        return;
    }

    setSubmissionStatus(prev => ({
      ...prev,
      [currentCartItemId]: "Submitting return request...",
    }));

    const token = localStorage.getItem("yourAuthTokenKey");
    if (!token) {
      setSubmissionStatus(prev => ({
        ...prev,
        [currentCartItemId]: "Authentication error. Please log in again.",
      }));
      console.error("ERROR: handleSubmitReturn - Authentication token not found."); // LOG 16
      return;
    }

    console.log("HANDLE_SUBMIT_RETURN: Sending API request for:", {
        orderId,
        cartItemId: currentCartItemId,
        reason: selectedReason,
        details: returnDetails
    }); // LOG 17

    try {
      const response = await fetch(
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}/item/${currentCartItemId}/return`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reason: selectedReason,
            details: returnDetails,
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.order) {
        setOrderDetails(responseData.order);
        setSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: "Return requested successfully!",
        }));
        console.log("API_SUCCESS: Return request successful. Updated order:", responseData.order); // LOG 18
        setTimeout(() => {
            setReturningProductId(null);
            setSelectedReason('');
            setReturnDetails('');
            setSubmissionStatus(prev => ({ ...prev, [currentCartItemId]: '' }));
        }, 1500);
      } else {
        const errorMessage = responseData.error || responseData.message || "Failed to submit return request. Please try again.";
        setSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: errorMessage,
        }));
        console.error("API_ERROR: Return submission failed.", response.status, responseData); // LOG 19
      }
    } catch (err) {
      console.error("NETWORK_ERROR: Return submission network error:", err); // LOG 20
      setSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: "A network error occurred. Please check your internet connection.",
      }));
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.125rem', fontWeight: '600' }}>Loading order details...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.125rem', fontWeight: '600', color: '#dc2626', padding: '1rem', textAlign: 'center' }}>{error}</div>;
  }

  if (!orderDetails) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.125rem', fontWeight: '600' }}>No order details found.</div>;
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '2rem', color: '#374151' }}>Order Details</h1>

      <div style={{ backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          <p><strong>Order ID:</strong> {orderDetails._id}</p>
          <p><strong>Order Date:</strong> {new Date(orderDetails.createdAt).toLocaleDateString()}</p>
          <p>
            <strong>Status:</strong>
            <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.875rem', fontWeight: '600', borderRadius: '9999px',
              backgroundColor: orderDetails.orderStatus === 'delivered' ? '#dcfce7' : orderDetails.orderStatus === 'processing' ? '#fef9c3' : '#e5e7eb',
              color: orderDetails.orderStatus === 'delivered' ? '#166534' : orderDetails.orderStatus === 'processing' ? '#a16207' : '#4b5563'
            }}>
              {orderDetails.orderStatus}
            </span>
          </p>
          <p style={{ fontSize: '1.25rem', fontWeight: 'bold', gridColumn: 'span 2 / span 2' }}><strong>Total:</strong> ${orderDetails.grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#374151' }}>Products in this Order</h2>
      <ul style={{ listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {orderDetails.cartItems.map((item) => {
          const itemReturnStatus = item.returnStatus;
          const currentSubmissionStatus = submissionStatus[item._id] || '';

          return (
            <li key={item._id} style={{ padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                {item.image && (
                  <div style={{ width: '100%', height: '8rem', position: 'relative', marginRight: '0', marginBottom: '1rem', flexShrink: '0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                    <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                  </div>
                )}
                <div style={{ flexGrow: '1', width: '100%' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h3>
                  <p>Qty: {item.quantity}</p>
                  <p>Price: ${item.price.toFixed(2)}</p>
                  <p style={{ fontWeight: '600', marginTop: '0.5rem' }}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                  {itemReturnStatus && itemReturnStatus !== "NotReturned" ? (
                    <span style={{
                        fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center',
                        backgroundColor: itemReturnStatus === "ReturnRejected" ? '#fee2e2' : (itemReturnStatus === "Returned" ? '#dcfce7' : '#fef3c7'),
                        color: itemReturnStatus === "ReturnRejected" ? '#b91c1c' : (itemReturnStatus === "Returned" ? '#166534' : '#92400e')
                    }}>
                        Status: {itemReturnStatus}
                        {item.returnReason && ` (${item.returnReason})`}
                    </span>
                  ) : returningProductId === item._id && currentSubmissionStatus && !currentSubmissionStatus.toLowerCase().includes("success") && !currentSubmissionStatus.toLowerCase().includes("requested") && currentSubmissionStatus !== "" ? (
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: currentSubmissionStatus.includes("Failed") || currentSubmissionStatus.includes("error") || currentSubmissionStatus.includes("Authentication error") ? '#dc2626' : '#ca8a04' }}>
                        {currentSubmissionStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReturnClick(item._id)}
                      disabled={false} // <--- THIS IS THE CRUCIAL CHANGE FOR TESTING
                      style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: !!returningProductId ? 0.6 : 1 }}
                    >
                      Return This Product
                    </button>
                  )}
                </div>
              </div>

              {returningProductId === item._id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Return Reason for: <span style={{ fontWeight: 'bold' }}>{item.name}</span></h4>
                  {currentSubmissionStatus && (
                      <p style={{
                          color: currentSubmissionStatus.includes("Failed") || currentSubmissionStatus.includes("error") || currentSubmissionStatus.includes("Authentication error") ? '#991b1b' : (currentSubmissionStatus.includes("Success") ? '#166534' : '#92400e'),
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: currentSubmissionStatus.includes("Failed") || currentSubmissionStatus.includes("error") || currentSubmissionStatus.includes("Authentication error") ? '#fee2e2' : (currentSubmissionStatus.includes("Success") ? '#dcfce7' : '#fef3c7'),
                          borderRadius: '0.375rem',
                          border: `1px solid ${currentSubmissionStatus.includes("Failed") || currentSubmissionStatus.includes("error") || currentSubmissionStatus.includes("Authentication error") ? '#fca5a5' : (currentSubmissionStatus.includes("Success") ? '#86efac' : '#fde68a')}`
                      }}>
                          {currentSubmissionStatus}
                      </p>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                    {returnReasons.map((reason) => (
                      <label
                        key={reason}
                        style={{
                          display: 'flex', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem',
                          borderRadius: '0.25rem', cursor: 'pointer',
                          backgroundColor: selectedReason === reason ? '#3b82f6' : 'transparent',
                          color: selectedReason === reason ? '#fff' : '#374151',
                          transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
                          border: '1px solid #d1d5db'
                        }}
                      >
                        <input
                          type="radio"
                          name={`returnReason-${item._id}`}
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }}
                        />
                        {reason}
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder="Provide more details (optional)"
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                    rows={4}
                  ></textarea>
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={handleSubmitReturn}
                      disabled={!selectedReason || (currentSubmissionStatus && (currentSubmissionStatus.includes("Submitting") || currentSubmissionStatus.includes("success")))}
                      style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', fontWeight: '600', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (!selectedReason || (currentSubmissionStatus && (currentSubmissionStatus.includes("Submitting") || currentSubmissionStatus.includes("success")))) ? 0.6 : 1 }}
                    >
                      {currentSubmissionStatus && currentSubmissionStatus.includes("Submitting") ? 'Submitting...' : 'Submit Return Request'}
                    </button>
                    <button
                      onClick={handleCancelReturn}
                      style={{ width: '100%', backgroundColor: '#e5e7eb', color: '#4b5563', fontWeight: '600', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default OrderDetailsPage;