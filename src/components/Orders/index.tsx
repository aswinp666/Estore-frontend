import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";

// Define a basic interface for an item within cartItems
interface CartItem {
  name: string;
  // Add other properties if needed, e.g., price, quantity
}

// Define a basic interface for an order as received from your backend API
interface ApiOrder {
  _id: string;
  createdAt: string;
  orderStatus?: string | null; // Can be string or null/undefined
  grandTotal?: number | null; // Can be number or null/undefined
  cartItems?: CartItem[];
  // Add any other properties your API returns for an order
}

// Define the interface for the transformed order object used within this component
interface TransformedOrder {
  orderId: string;
  createdAt: string;
  status?: string; // Optional, as it might be null from API
  name: string;
  total: string;
}

const Orders = () => {
  // State to hold the transformed order data
  const [orders, setOrders] = useState<TransformedOrder[]>([]);
  // State to manage loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to hold any error messages
  const [error, setError] = useState<string | null>(null);
  // New state to explicitly track if the user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null means checking

  // useEffect hook to fetch user orders when the component mounts
  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoading(true); // Set loading to true at the start of the fetch operation
      setError(null);    // Clear any previous errors

      // Retrieve the authentication token from local storage
      const token = localStorage.getItem("yourAuthTokenKey");

      // Set authentication status
      if (token) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setLoading(false); // Stop loading as we won't make an API call
        return; // Exit the function, as no token means no authenticated request
      }

      try {
        // Make the API call to fetch user orders
        const response = await fetch('https://estore-backend-dyl3.onrender.com/api/invoice/my-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        // Check if the response was not successful (e.g., 4xx or 5xx status codes)
        if (!response.ok) {
          // Handle specific unauthorized/forbidden errors (though frontend already checked token presence)
          if (response.status === 401 || response.status === 403) {
            setError("Session expired or unauthorized. Please log in again.");
            setIsAuthenticated(false); // Update auth status if token is invalid on backend
          } else {
            // For other non-OK responses, throw an error
            throw new Error(`Failed to fetch orders. Status: ${response.status}`);
          }
        }

        // Parse the JSON response from the API
        const data = await response.json();

        // Determine the raw orders array from the API response.
        const rawOrders: ApiOrder[] = Array.isArray(data) ? data : data.orders || [];

        // Transform the raw API order data into the format expected by SingleOrder
        const transformedOrders: TransformedOrder[] = rawOrders.map((apiOrder: ApiOrder) => {
          let orderName = 'N/A';
          // Derive the order name from the first item in cartItems
          if (apiOrder.cartItems && apiOrder.cartItems.length > 0) {
            orderName = apiOrder.cartItems[0].name;
            // Add an indicator if there are more items
            if (apiOrder.cartItems.length > 1) {
              orderName += ` (+${apiOrder.cartItems.length - 1} more)`;
            }
          }

          return {
            orderId: apiOrder._id, // Use _id from backend data
            // Format the creation date
            createdAt: new Date(apiOrder.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            // Convert order status to lowercase for consistency
            status: apiOrder.orderStatus?.toLowerCase(),
            name: orderName, // The derived name for the order
            // Format the total with Rupee symbol and two decimal places
            total: `₹${parseFloat((apiOrder.grandTotal || 0).toString()).toFixed(2)}`,
          };
        });

        // Update the orders state with the transformed data
        setOrders(transformedOrders);
      } catch (err: any) {
        // Catch any errors during the fetch operation and set the error state
        setError(err.message || "An unknown error occurred while fetching orders.");
        console.error("Fetch error in Orders.tsx:", err); // Log the error for debugging
      } finally {
        // Always set loading to false after the fetch operation completes (success or failure)
        setLoading(false);
      }
    };

    fetchUserOrders(); // Call the fetch function when the component mounts

  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Conditional rendering for loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-lg text-gray-500">Loading your orders...</p>
        {/* You can replace this with a spinner component if you have one */}
      </div>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <div className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <button
          onClick={() => window.location.reload()} // Simple retry by reloading the page
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // If not authenticated, display a message that no orders can be shown
  if (isAuthenticated === false) {
    return (
      <div className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center">
        <p className="text-gray-500 text-lg">
          Please log in to view your order history.
        </p>
        {/* You might want to add a login button here */}
        <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center text-gray-500">
             You don&apos;t have any orders yet!
        </p>
      </div>
    );
  }


  // Main component rendering for authenticated users
  return (
    <>
      <div className="w-full overflow-x-auto">
        {/* Order table header and items for medium and larger screens */}
        <div className="min-w-[770px] hidden md:block">
          {orders.length > 0 && (
            <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
              <div className="min-w-[111px]">
                <p className="text-custom-sm text-dark">Order</p>
              </div>
              <div className="min-w-[175px]">
                <p className="text-custom-sm text-dark">Date</p>
              </div>
              <div className="min-w-[128px]">
                <p className="text-custom-sm text-dark">Status</p>
              </div>
              <div className="min-w-[213px]">
                <p className="text-custom-sm text-dark">Title</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Total</p>
              </div>
              <div className="min-w-[113px]">
                <p className="text-custom-sm text-dark">Action</p>
              </div>
            </div>
          )}

          {/* Render SingleOrder components for larger screens */}
          {orders.length > 0 ? (
            orders.map((orderItem) => (
              <SingleOrder key={orderItem.orderId} orderItem={orderItem} smallView={false} />
            ))
          ) : (
            // Message when no orders are found for larger screens
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center text-gray-500">
              You don&apos;t have any orders yet!
            </p>
          )}
        </div>

        {/* Order items for small screens (mobile view) */}
        <div className="md:hidden">
          {orders.length > 0 ? (
            orders.map((orderItem) => (
              // Using a different prefix for key to ensure uniqueness if React reconciliation gets confused
              <SingleOrder key={`sm-${orderItem.orderId}`} orderItem={orderItem} smallView={true} />
            ))
          ) : (
            // Message when no orders are found for small screens
            <p className="py-9.5 px-4 sm:px-7.5 xl:px-10 text-center text-gray-500">
              You don&apos;t have any orders yet!
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Orders;