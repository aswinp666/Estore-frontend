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
  // New fields for rating status (client-side flag for this order instance)
  hasRated?: boolean; // To track if the user has rated this specific item in the order
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

  console.log("RENDER: OrderDetailsPage component. Order ID from URL:", orderId);

  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [returningProductId, setReturningProductId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<{ [cartItemId: string]: string }>({});

  // New state for rating
  const [ratingProductId, setRatingProductId] = useState<string | null>(null); // Stores the cartItemId of the product being rated
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [ratingComment, setRatingComment] = useState<string>(''); // State for the review comment
  const [ratingSubmissionStatus, setRatingSubmissionStatus] = useState<{ [cartItemId: string]: string }>({});

  console.log("RENDER: Current returningProductId state:", returningProductId);


  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        console.warn("FETCH: No orderId available. Skipping fetch.");
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
        console.log("FETCH: Attempting to fetch order details from:", url);
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
            console.error(`Workspace: Failed from ${url} with status: ${response.status}, response text: ${await response.text()}`);
          }
        } catch (err) {
          console.error(`Workspace: Error fetching order details from ${url}:`, err);
        }
      }

      if (responseOk && data) {
        // Here, you could potentially check if the user has already rated items
        // by making another API call to get product details (which include ratings)
        // For simplicity in this example, we'll rely on a client-side `hasRated` flag.
        setOrderDetails(data);
        console.log("FETCH: Order details loaded successfully:", data);
        if (data.cartItems && data.cartItems.length > 0) {
            console.log("FETCH: First cart item in data (full object):", data.cartItems[0]);
            console.log("FETCH: First cart item _id (extracted from data):", data.cartItems[0]._id);
        } else {
            console.warn("FETCH: No cart items found in order data or cartItems array is empty.");
        }
      } else {
        setError(`Failed to fetch order details for Order ID: ${orderId}. Please check the Order ID or try again later.`);
        console.error(`Workspace: Failed from all attempted URLs. Last attempt: ${attemptedUrl}`);
      }
      setLoading(false);
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const handleReturnClick = (cartItemId: string) => {
    console.log("HANDLE_RETURN_CLICK: Button clicked for cartItemId:", cartItemId);
    setReturningProductId(cartItemId);
    console.log("HANDLE_RETURN_CLICK: returningProductId state set to:", cartItemId);
    setSelectedReason('');
    setReturnDetails('');
    setSubmissionStatus(prev => ({ ...prev, [cartItemId]: '' }));
    setRatingProductId(null); // Close rating form if open
  };

  const handleCancelReturn = () => {
    console.log("CANCEL_RETURN: Cancelling return request.");
    if (returningProductId) {
        setSubmissionStatus(prev => ({ ...prev, [returningProductId]: '' }));
    }
    setReturningProductId(null);
    setSelectedReason('');
    setReturnDetails('');
  };

  const handleSubmitReturn = async () => {
    const currentCartItemId = returningProductId;

    console.log("HANDLE_SUBMIT_RETURN: Function called. Checking data...");
    console.log("HANDLE_SUBMIT_RETURN: currentCartItemId:", currentCartItemId, "orderId:", orderId);

    if (!currentCartItemId || !orderId) {
        setSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId || 'unknown']: "Submission error: Product or Order ID missing. Check console.",
        }));
        console.error("ERROR: handleSubmitReturn - Missing currentCartItemId or orderId.", { currentCartItemId, orderId });
        return;
    }

    if (!selectedReason) {
        setSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId]: "Please select a return reason.",
        }));
        console.warn("WARNING: handleSubmitReturn - No return reason selected.");
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
      console.error("ERROR: handleSubmitReturn - Authentication token not found.");
      return;
    }

    console.log("HANDLE_SUBMIT_RETURN: Sending API request for:", {
        orderId,
        cartItemId: currentCartItemId,
        reason: selectedReason,
        details: returnDetails
    });

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
        console.log("API_SUCCESS: Return request successful. Updated order:", responseData.order);
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
        console.error("API_ERROR: Return submission failed.", response.status, responseData);
      }
    } catch (err) {
      console.error("NETWORK_ERROR: Return submission network error:", err);
      setSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: "A network error occurred. Please check your internet connection.",
      }));
    }
  };

  // --- NEW RATING FUNCTIONS ---
  const handleRateClick = (cartItemId: string) => {
    setRatingProductId(cartItemId);
    setCurrentRating(0); // Reset rating
    setRatingComment(''); // Reset comment
    setRatingSubmissionStatus(prev => ({ ...prev, [cartItemId]: '' }));
    setReturningProductId(null); // Close return form if open
  };

  const handleCancelRating = () => {
    if (ratingProductId) {
        setRatingSubmissionStatus(prev => ({ ...prev, [ratingProductId]: '' }));
    }
    setRatingProductId(null);
    setCurrentRating(0);
    setRatingComment('');
  };

  const handleSubmitRating = async (cartItem: CartItem) => {
    const currentCartItemId = ratingProductId;
    const productId = cartItem.productId; // Get the actual product ID from the cart item

    if (!currentCartItemId || !productId || !orderId) { // Ensure all necessary IDs are present
        setRatingSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId || 'unknown']: "Submission error: Product or Order ID missing. Check console.",
        }));
        console.error("ERROR: handleSubmitRating - Missing IDs.", { currentCartItemId, productId, orderId });
        return;
    }

    if (currentRating === 0) {
        setRatingSubmissionStatus(prev => ({
            ...prev,
            [currentCartItemId]: "Please select a star rating.",
        }));
        return;
    }

    setRatingSubmissionStatus(prev => ({
      ...prev,
      [currentCartItemId]: "Submitting rating...",
    }));

    const token = localStorage.getItem("yourAuthTokenKey");
    if (!token) {
      setRatingSubmissionStatus(prev => ({
        ...prev,
        [currentCartItemId]: "Authentication error. Please log in again.",
      }));
      console.error("ERROR: handleSubmitRating - Authentication token not found.");
      return;
    }

    try {
      const response = await fetch(
        `https://estore-backend-dyl3.onrender.com/api/products/${productId}/review`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rating: currentRating,
            comment: ratingComment, // Send the comment to the backend
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setRatingSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: "Rating submitted successfully!",
        }));

        // OPTIONAL: Update the specific cart item's hasRated status in local state
        // This won't persist if the page is refreshed unless stored in backend
        setOrderDetails(prevDetails => {
            if (!prevDetails) return null;
            const updatedCartItems = prevDetails.cartItems.map(item =>
                item._id === currentCartItemId ? { ...item, hasRated: true } : item
            );
            return { ...prevDetails, cartItems: updatedCartItems };
        });

        setTimeout(() => {
            setRatingProductId(null);
            setCurrentRating(0);
            setRatingComment('');
            setRatingSubmissionStatus(prev => ({ ...prev, [currentCartItemId]: '' }));
        }, 1500);
      } else {
        const errorMessage = responseData.error || responseData.message || "Failed to submit rating. Please try again.";
        setRatingSubmissionStatus(prev => ({
          ...prev,
          [currentCartItemId]: errorMessage,
        }));
        console.error("API_ERROR: Rating submission failed.", response.status, responseData);
      }
    } catch (err) {
      console.error("NETWORK_ERROR: Rating submission network error:", err);
      setRatingSubmissionStatus(prev => ({
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

  // Determine if the order is delivered for enabling ratings
  const isOrderDelivered = orderDetails.orderStatus === 'Delivered';

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
              backgroundColor: orderDetails.orderStatus === 'Delivered' ? '#dcfce7' : orderDetails.orderStatus === 'Processing' ? '#fef9c3' : '#e5e7eb',
              color: orderDetails.orderStatus === 'Delivered' ? '#166534' : orderDetails.orderStatus === 'Processing' ? '#a16207' : '#4b5563'
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
          const currentReturnSubmissionStatus = submissionStatus[item._id] || '';
          const currentRatingSubmissionStatus = ratingSubmissionStatus[item._id] || '';
          // Only allow rating if the order is delivered, the item has a productId,
          // and the item hasn't been marked as 'hasRated' (client-side check for this session)
          const canRate = isOrderDelivered && item.productId && !item.hasRated;

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
                <div style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  {/* Return Button/Status */}
                  {itemReturnStatus && itemReturnStatus !== "NotReturned" ? (
                    <span style={{
                        fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center',
                        backgroundColor: itemReturnStatus === "ReturnRejected" ? '#fee2e2' : (itemReturnStatus === "Returned" ? '#dcfce7' : '#fef3c7'),
                        color: itemReturnStatus === "ReturnRejected" ? '#b91c1c' : (itemReturnStatus === "Returned" ? '#166534' : '#92400e')
                    }}>
                        Status: {itemReturnStatus}
                        {item.returnReason && ` (${item.returnReason})`}
                    </span>
                  ) : returningProductId === item._id && currentReturnSubmissionStatus && !currentReturnSubmissionStatus.toLowerCase().includes("success") && !currentReturnSubmissionStatus.toLowerCase().includes("requested") && currentReturnSubmissionStatus !== "" ? (
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: currentReturnSubmissionStatus.includes("Failed") || currentReturnSubmissionStatus.includes("error") || currentReturnSubmissionStatus.includes("Authentication error") ? '#dc2626' : '#ca8a04' }}>
                        {currentReturnSubmissionStatus}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleReturnClick(item._id)}
                      disabled={!!returningProductId || !!ratingProductId} // Disable if another form is open
                      style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (!!returningProductId || !!ratingProductId) ? 0.6 : 1 }}
                    >
                      Return This Product
                    </button>
                  )}

                  {/* Rating Button/Status */}
                  {canRate && ratingProductId !== item._id ? (
                     <button
                       onClick={() => handleRateClick(item._id)}
                       disabled={!!returningProductId || !!ratingProductId} // Disable if another form is open
                       style={{ backgroundColor: '#059669', color: '#fff', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (!!returningProductId || !!ratingProductId) ? 0.6 : 1 }}
                     >
                       Rate This Product
                     </button>
                   ) : item.hasRated && isOrderDelivered ? ( // Show if already rated (frontend flag)
                       <span style={{ fontSize: '0.875rem', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', textAlign: 'center', backgroundColor: '#d1fae5', color: '#065f46' }}>
                           You have rated this product.
                       </span>
                   ) : null}
                </div>
              </div>

              {/* Return Form */}
              {returningProductId === item._id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Return Reason for: <span style={{ fontWeight: 'bold' }}>{item.name}</span></h4>
                  {currentReturnSubmissionStatus && (
                      <p style={{
                          color: currentReturnSubmissionStatus.includes("Failed") || currentReturnSubmissionStatus.includes("error") || currentReturnSubmissionStatus.includes("Authentication error") ? '#991b1b' : (currentReturnSubmissionStatus.includes("Success") ? '#166534' : '#92400e'),
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: currentReturnSubmissionStatus.includes("Failed") || currentReturnSubmissionStatus.includes("error") || currentReturnSubmissionStatus.includes("Authentication error") ? '#fee2e2' : (currentReturnSubmissionStatus.includes("Success") ? '#dcfce7' : '#fef3c7'),
                          borderRadius: '0.375rem',
                          border: `1px solid ${currentReturnSubmissionStatus.includes("Failed") || currentReturnSubmissionStatus.includes("error") || currentReturnSubmissionStatus.includes("Authentication error") ? '#fca5a5' : (currentReturnSubmissionStatus.includes("Success") ? '#86efac' : '#fde68a')}`
                      }}>
                          {currentReturnSubmissionStatus}
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
                      disabled={!selectedReason || (currentReturnSubmissionStatus && (currentReturnSubmissionStatus.includes("Submitting") || currentReturnSubmissionStatus.includes("success")))}
                      style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', fontWeight: '600', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (!selectedReason || (currentReturnSubmissionStatus && (currentReturnSubmissionStatus.includes("Submitting") || currentReturnSubmissionStatus.includes("success")))) ? 0.6 : 1 }}
                    >
                      {currentReturnSubmissionStatus && currentReturnSubmissionStatus.includes("Submitting") ? 'Submitting...' : 'Submit Return Request'}
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

              {/* NEW RATING FORM */}
              {ratingProductId === item._id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                  <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Rate <span style={{ fontWeight: 'bold' }}>{item.name}</span></h4>
                  {currentRatingSubmissionStatus && (
                      <p style={{
                          color: currentRatingSubmissionStatus.includes("Failed") || currentRatingSubmissionStatus.includes("error") || currentRatingSubmissionStatus.includes("Authentication error") ? '#991b1b' : (currentRatingSubmissionStatus.includes("Success") ? '#166534' : '#92400e'),
                          fontSize: '0.875rem',
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          backgroundColor: currentRatingSubmissionStatus.includes("Failed") || currentRatingSubmissionStatus.includes("error") || currentRatingSubmissionStatus.includes("Authentication error") ? '#fee2e2' : (currentRatingSubmissionStatus.includes("Success") ? '#dcfce7' : '#fef3c7'),
                          borderRadius: '0.375rem',
                          border: `1px solid ${currentRatingSubmissionStatus.includes("Failed") || currentRatingSubmissionStatus.includes("error") || currentRatingSubmissionStatus.includes("Authentication error") ? '#fca5a5' : (currentRatingSubmissionStatus.includes("Success") ? '#86efac' : '#fde68a')}`
                      }}>
                          {currentRatingSubmissionStatus}
                      </p>
                  )}
                  <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.25rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setCurrentRating(star)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          color: star <= currentRating ? '#fcd34d' : '#d1d5db', // Yellow for selected, grey for unselected
                          transition: 'color 0.2s ease-in-out',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  {/* TEXTAREA FOR REVIEW COMMENT */}
                  <textarea
                    placeholder="Write a review (optional)"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '0.875rem' }}
                    rows={4}
                  ></textarea>
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => handleSubmitRating(item)}
                      disabled={currentRating === 0 || (currentRatingSubmissionStatus && (currentRatingSubmissionStatus.includes("Submitting") || currentRatingSubmissionStatus.includes("success")))}
                      style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', fontWeight: '600', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (currentRating === 0 || (currentRatingSubmissionStatus && (currentRatingSubmissionStatus.includes("Submitting") || currentRatingSubmissionStatus.includes("success")))) ? 0.6 : 1 }}
                    >
                      {currentRatingSubmissionStatus && currentRatingSubmissionStatus.includes("Submitting") ? 'Submitting...' : 'Submit Rating'}
                    </button>
                    <button
                      onClick={handleCancelRating}
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