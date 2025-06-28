// page.js
'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import ProductForm from './ProductForm'; // Assuming ProductForm is in the same directory
import ProductList from './ProductList'; // Assuming ProductList is in the same directory
import GlassCard from './GlassCard'; // Assuming GlassCard is in the same directory
import { useRouter, usePathname } from 'next/navigation';
import DashboardOverview from './DashboardOverview'; // We will create this next for the main dashboard view

const API_BASE_URL = 'http://localhost:5000/api'; // Make sure this matches your backend URL
// In a real application, store this in environment variables (.env.local)

const SellerDashboardPage = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path to determine which component to show

  const [products, setProducts] = useState([]);
  const [productToEdit, setProductToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshProducts, setRefreshProducts] = useState(false); // State to trigger product list refresh

  // Fetch products whenever the component mounts or refreshProducts state changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Replace with dynamic token retrieval (e.g., from localStorage or a global state)
        const token = localStorage.getItem('token'); // Assuming JWT token is stored here
        if (!token) {
          router.push('/login'); // Redirect to login if no token
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT token
          },
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to fetch products. Please try again.');
        // Handle unauthorized access (e.g., token expired)
        if (err.response && err.response.status === 401) {
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (pathname.includes('/products/listings') || pathname.includes('/products/add')) {
        fetchProducts();
    }
  }, [refreshProducts, pathname, router]);


  const handleAddProductSuccess = () => {
    setRefreshProducts(prev => !prev); // Toggle to trigger re-fetch
    setProductToEdit(null); // Clear any product being edited
    router.push('/seller-dashboard/products/listings'); // Navigate to product listings
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    router.push('/seller-dashboard/products/add'); // Navigate to add/edit form
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRefreshProducts(prev => !prev); // Trigger re-fetch to update list
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      );
    }

    // Determine which component to render based on the current path
    if (pathname.endsWith('/seller-dashboard/products/add')) {
      return (
        <ProductForm
          productToEdit={productToEdit}
          onProductSaved={handleAddProductSuccess}
          API_BASE_URL={API_BASE_URL}
        />
      );
    } else if (pathname.endsWith('/seller-dashboard/products/listings') || pathname.endsWith('/seller-dashboard/products/inventory')) {
      // Both listings and inventory could use ProductList, potentially with different filters/views
      return (
        <ProductList
          products={products}
          onEdit={handleEditProduct}
          onDelete={handleDeleteProduct}
        />
      );
    } else if (pathname.endsWith('/seller-dashboard/orders')) {
        // Placeholder for Orders component
        return (
            <GlassCard sx={{ p: 4, mt: 3 }}>
                <Typography variant="h5" gutterBottom>Orders Management</Typography>
                <Typography variant="body1" color="text.secondary">
                    View and manage your customer orders here. (Coming Soon)
                </Typography>
            </GlassCard>
        );
    } else if (pathname.endsWith('/seller-dashboard/analytics')) {
        // Placeholder for Sales & Analytics component
        return (
            <DashboardOverview API_BASE_URL={API_BASE_URL} />
        );
    } else if (pathname.endsWith('/seller-dashboard/profile') || pathname.endsWith('/seller-dashboard/settings')) {
        // Placeholder for Profile/Settings component
        return (
            <GlassCard sx={{ p: 4, mt: 3 }}>
                <Typography variant="h5" gutterBottom>Account Settings</Typography>
                <Typography variant="body1" color="text.secondary">
                    Manage your profile, payment info, and notification settings here.
                    (Note: Backend API endpoints for updating profile and bank details are not fully provided in your current backend files. You may need to implement these.)
                </Typography>
                <Button variant="contained" sx={{mt:2}}>Edit Profile</Button>
            </GlassCard>
        );
    }
    // Default dashboard overview
    return (
        <DashboardOverview API_BASE_URL={API_BASE_URL} />
    );
  };

  return (
    <Box>
      {renderContent()}
    </Box>
  );
};

export default SellerDashboardPage;