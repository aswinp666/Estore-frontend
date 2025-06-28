// DashboardOverview.js
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  CardContent,
  Card,
  useTheme
} from '@mui/material';
import axios from 'axios';
import GlassCard from './GlassCard'; // Assuming GlassCard is in the same directory
import {
  MonetizationOn as MonetizationOnIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

const DashboardOverview = ({ API_BASE_URL }) => {
  const theme = useTheme();
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topSellingProducts: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          // Handle unauthenticated state, maybe redirect to login
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }

        // Fetch all invoices
        const response = await axios.get(`${API_BASE_URL}/invoice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const invoices = response.data;

        // Process data
        let totalSales = 0;
        let totalOrders = invoices.length;
        const productSales = {}; // To track quantity and revenue per product
        const recentOrders = invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by newest
            .slice(0, 5); // Get top 5 recent orders

        invoices.forEach(invoice => {
          totalSales += invoice.grandTotal;
          invoice.cartItems.forEach(item => {
            const productId = item.productId;
            if (!productSales[productId]) {
              productSales[productId] = {
                name: item.name,
                quantitySold: 0,
                revenue: 0,
              };
            }
            productSales[productId].quantitySold += item.quantity;
            productSales[productId].revenue += (item.discountedPrice || item.price) * item.quantity;
          });
        });

        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        // Convert productSales object to array and sort for top selling
        const topSellingProducts = Object.values(productSales)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 5); // Top 5 products

        setSalesData({
          totalSales,
          totalOrders,
          averageOrderValue,
          topSellingProducts,
          recentOrders
        });

      } catch (err) {
        console.error('Error fetching sales data:', err);
        setError('Failed to load sales data. Please check your backend connection or authentication.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Seller Dashboard Overview
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <MonetizationOnIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Total Sales</Typography>
              <Typography variant="h5" color="primary">₹{salesData.totalSales.toFixed(2)}</Typography>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Total Orders</Typography>
              <Typography variant="h5" color="secondary">{salesData.totalOrders}</Typography>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AssessmentIcon sx={{ fontSize: 40, color: theme.palette.info.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Average Order Value</Typography>
              <Typography variant="h5" color="info">₹{salesData.averageOrderValue.toFixed(2)}</Typography>
            </Box>
          </GlassCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <GlassCard elevation={3} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.success.main }} />
            <Box>
              <Typography variant="h6" fontWeight={600}>Top Selling Item</Typography>
              <Typography variant="h5" color="success">
                {salesData.topSellingProducts.length > 0 ? salesData.topSellingProducts[0].name : 'N/A'}
              </Typography>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Top Selling Products (Quantity)
            </Typography>
            {salesData.topSellingProducts.length > 0 ? (
              <List>
                {salesData.topSellingProducts.map((product, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={`${product.name} - ${product.quantitySold} sold`} secondary={`Revenue: ₹${product.revenue.toFixed(2)}`} />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No product sales data available.</Typography>
            )}
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              Recent Orders
            </Typography>
            {salesData.recentOrders.length > 0 ? (
              <List>
                {salesData.recentOrders.map((order) => (
                  <ListItem key={order._id}>
                    <ListItemText
                      primary={`Order #${order._id.substring(order._id.length - 6)} - ₹${order.grandTotal.toFixed(2)}`}
                      secondary={`Status: ${order.orderStatus} | ${new Date(order.createdAt).toLocaleDateString()}`}
                    />
                     <Button size="small" variant="outlined">View Details</Button>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">No recent orders.</Typography>
            )}
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;