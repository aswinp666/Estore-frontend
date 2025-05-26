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
  // Assuming these fields might be present for payment/billing info
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

  console.log("Frontend - Order ID from URL params:", orderId); // ADDED LOG for debugging

  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [returningProductId, setReturningProductId] = useState<string | null>(null); // This stores the _id of the cartItem being returned
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<{ [cartItemId: string]: string }>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        console.warn("Frontend - No orderId available in URL parameters. Cannot fetch order details.");
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

      // Prioritize the route that matches your backend's router.get("/:id")
      const urlsToTry = [
        `https://estore-backend-dyl3.onrender.com/api/invoice/${orderId}`, // Matches backend's router.get("/:id")
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}`, // This route might not exist on your backend's invoice.js unless you add it
      ];

      let data: OrderDetailsData | null = null;
      let responseOk = false;
      let attemptedUrl = '';

      for (const url of urlsToTry) {
        attemptedUrl = url;
        console.log("Frontend - Attempting to fetch order details from:", url); // ADDED LOG
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const responseData = await response.json();
            // Check if the response is the order itself or nested (e.g., { order: { ... } } or { invoice: { ... } })
            if (responseData && typeof responseData === 'object') {
                if (responseData.order && typeof responseData.order === 'object') {
                    data = responseData.order;
                } else if (responseData.invoice && typeof responseData.invoice === 'object') {
                    data = responseData.invoice;
                } else if (responseData._id) { // Direct invoice object
                    data = responseData;
                }
            }
            if(data && data._id === orderId) { // Ensure the fetched data is indeed the order we asked for
                responseOk = true;
                break;
            } else {
                console.warn(`Frontend - Fetched data ID mismatch or invalid structure for URL: ${url}`);
                data = null; // Reset data if it's not the correct order structure or ID
            }
          } else {
            console.error(`Frontend - Fetch failed from ${url} with status: ${response.status}, response text: ${await response.text()}`); // More detailed error
          }
        } catch (err) {
          console.error(`Frontend - Error fetching order details from ${url}:`, err);
        }
      }

      if (responseOk && data) {
        setOrderDetails(data);
        console.log("Frontend - Order details loaded successfully:", data); // ADDED LOG
      } else {
        setError(`Failed to fetch order details for Order ID: ${orderId}. Please check the Order ID or try again later.`);
        console.error(`Frontend - Failed to fetch from all attempted URLs. Last attempt: ${attemptedUrl}`);
      }
      setLoading(false);
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]); // orderId is a dependency here

  const handleReturnClick = (cartItemId: string) => {
    setReturningProductId(cartItemId);
    setSelectedReason('');
    setReturnDetails('');
    setSubmissionStatus(prev => ({ ...prev, [cartItemId]: '' })); // Clear previous submission status for this item
  };

  const handleCancelReturn = () => {
    if (returningProductId) {
        setSubmissionStatus(prev => ({ ...prev, [returningProductId]: '' })); // Clear submission status
    }
    setReturningProductId(null);
    setSelectedReason('');
    setReturnDetails('');
  };

  const handleSubmitReturn = async (cartItemId: string) => {
    // Add a debugger statement to pause execution here
    // debugger;

    if (!returningProductId || !orderId || cartItemId !== returningProductId) {
        console.warn("Frontend - handleSubmitReturn called with missing/mismatched data:", { returningProductId, orderId, cartItemId });
        setSubmissionStatus(prev => ({
            ...prev,
            [cartItemId]: "Submission error: Internal data mismatch.",
        }));
        return;
    }

    if (!selectedReason) {
        setSubmissionStatus(prev => ({
            ...prev,
            [returningProductId]: "Please select a return reason.",
        }));
        console.warn("Frontend - Submit clicked without a reason.");
        return;
    }


    setSubmissionStatus(prev => ({
      ...prev,
      [returningProductId]: "Submitting return request...",
    }));

    const token = localStorage.getItem("yourAuthTokenKey");
    if (!token) {
      setSubmissionStatus(prev => ({
        ...prev,
        [returningProductId]: "Authentication error. Please log in again.",
      }));
      console.error("Frontend - Authentication token not found for return submission.");
      return;
    }

    console.log("Frontend - Submitting return request with:", {
        orderId,
        cartItemId: returningProductId,
        reason: selectedReason,
        details: returnDetails,
        tokenPresent: !!token
    }); // ADDED LOG

    try {
      const response = await fetch(
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}/item/${returningProductId}/return`,
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
        setOrderDetails(responseData.order); // Update the entire order details with the response
        setSubmissionStatus(prev => ({
          ...prev,
          [returningProductId]: "Return requested successfully!", // Success message
        }));
        // Optional: Keep the form open briefly to show success, then close
        setTimeout(() => {
            setReturningProductId(null); // Close the return form section
            setSelectedReason('');
            setReturnDetails('');
            setSubmissionStatus(prev => ({ ...prev, [cartItemId]: '' })); // Clear message
        }, 1500); // Close after 1.5 seconds
      } else {
        const errorMessage = responseData.error || responseData.message || "Failed to submit return request. Please try again.";
        setSubmissionStatus(prev => ({
          ...prev,
          [returningProductId]: errorMessage,
        }));
        console.error("Frontend - Return submission API error:", response.status, responseData); // ADDED LOG
      }
    } catch (err) {
      console.error("Frontend - Return submission network error:", err); // ADDED LOG
      const specificCartItemId = returningProductId;
      if (specificCartItemId) {
          setSubmissionStatus(prev => ({
          ...prev,
          [specificCartItemId]: "A network error occurred. Please check your internet connection.",
          }));
      }
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
                      disabled={!!returningProductId} // Disable other return buttons if one is active
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
                      onClick={() => handleSubmitReturn(item._id)}
                      disabled={!selectedReason || (currentSubmissionStatus && (currentSubmissionStatus.includes("Submitting") || currentSubmissionStatus.includes("success")))} // Disable on submit or success
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