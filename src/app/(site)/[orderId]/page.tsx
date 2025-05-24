// src/app/(site)/order-details/[orderId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

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

  const [orderDetails, setOrderDetails] = useState<OrderDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [returningProductId, setReturningProductId] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [returnDetails, setReturnDetails] = useState<string>('');
  const [submissionStatus, setSubmissionStatus] = useState<{ [productId: string]: string }>({});

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      setLoading(true);
      setError(null);
      const token = localStorage.getItem("yourAuthTokenKey");

      if (!token) {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
        return;
      }

      const urlsToTry = [
        `https://estore-backend-dyl3.onrender.com/api/invoice/my-orders/${orderId}`,
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}`,
        `https://estore-backend-dyl3.onrender.com/api/invoice/${orderId}`
      ];

      let data: OrderDetailsData | null = null;
      let responseOk = false;

      for (const url of urlsToTry) {
        try {
          const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            data = await response.json();
            if ((data as any).order) data = (data as any).order;
            if ((data as any).invoice) data = (data as any).invoice;
            responseOk = true;
            break;
          }
        } catch (err) {
          console.error(`Workspace error from ${url}:`, err);
        }
      }

      if (responseOk && data) {
        setOrderDetails(data);
      } else {
        setError("Failed to fetch order details.");
      }
      setLoading(false);
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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
      orderId,
      productId: returningProductId,
      reason: selectedReason,
      details: returnDetails,
    });

    setSubmissionStatus(prev => ({
      ...prev,
      [returningProductId]: "Return requested successfully! You will be contacted.",
    }));

    setReturningProductId(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.125rem', fontWeight: '600' }}>Loading order details...</div>;
  }

  if (error) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '1.125rem', fontWeight: '600', color: '#dc2626' }}>{error}</div>;
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
        {orderDetails.cartItems.map((item) => (
          <li key={item._id} style={{ padding: '1.5rem', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', borderRadius: '0.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {item.image && (
                <div style={{ width: '100%', height: '8rem', position: 'relative', marginRight: '0', marginBottom: '1rem', flexShrink: '0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                  <Image src={item.image} alt={item.name} layout="fill" objectFit="cover" />
                </div>
              )}
              <div style={{ flexGrow: '1' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem' }}>{item.name}</h3>
                <p>Qty: {item.quantity}</p>
                <p>Price: ${item.price.toFixed(2)}</p>
                <p style={{ fontWeight: '600', marginTop: '0.5rem' }}>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <div style={{ marginTop: '1rem', marginLeft: 'auto', alignSelf: 'flex-start' }}>
                {!submissionStatus[item._id] ? (
                  <button
                    onClick={() => handleReturnClick(item._id)}
                    disabled={!!returningProductId && returningProductId !== item._id}
                    style={{ backgroundColor: '#4f46e5', color: '#fff', fontWeight: '600', padding: '0.5rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: (!!returningProductId && returningProductId !== item._id) ? 0.6 : 1 }}
                  >
                    Return This Product
                  </button>
                ) : (
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#16a34a' }}>Return Requested</span>
                )}
              </div>
            </div>

            {submissionStatus[item._id] && returningProductId !== item._id && (
              <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#16a34a', backgroundColor: '#ecfdf5', padding: '0.75rem', borderRadius: '0.375rem' }}>{submissionStatus[item._id]}</p>
            )}

            {returningProductId === item._id && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>Return Reason for: <span style={{ fontWeight: 'bold' }}>{item.name}</span></h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                  {returnReasons.map((reason) => (
                    <label
                      key={reason}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        padding: '0.5rem', // Added padding for better click area
                        borderRadius: '0.25rem', // Slightly rounded corners
                        cursor: 'pointer', // Indicate it's clickable
                        backgroundColor: selectedReason === reason ? '#3b82f6' : 'transparent', // Blue background if selected
                        color: selectedReason === reason ? '#fff' : '#374151', // White text if selected
                        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out', // Smooth transition
                        border: '1px solid #d1d5db' // Add a subtle border
                      }}
                    >
                      <input
                        type="radio"
                        name={`returnReason-${item._id}`}
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }} // This will style the radio button itself in modern browsers
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
                    disabled={!selectedReason}
                    style={{ width: '100%', backgroundColor: '#16a34a', color: '#fff', fontWeight: '600', padding: '0.5rem 1.25rem', borderRadius: '0.375rem', fontSize: '0.875rem', border: 'none', cursor: 'pointer', opacity: !selectedReason ? 0.6 : 1 }}
                  >
                    Submit Return Request
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
        ))}
      </ul>
    </div>
  );
};

export default OrderDetailsPage;