// src/app/dashboard/order-history/page.js
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, useTheme, CircularProgress,
  TablePagination, Tooltip, Button, Stack, Avatar, Grid,
  Select, MenuItem, FormControl, InputLabel,
  Tabs, Tab
} from '@mui/material';
import {
  Receipt, ArrowDownward, ArrowUpward, Cancel, LocalShipping, CheckCircle,
  HourglassEmpty, ShoppingBag, DeliveryDining, ShoppingCartCheckout, Undo,
  AssignmentReturn // Icon for general return overview
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

// Define Order Statuses consistently
const ORDER_STATUSES = ["Processing", "Packaged", "Shipped", "Out For Delivery", "Delivered", "Cancelled"];

// Define Return Statuses for admin actions
const ADMIN_RETURN_STATUSES = ["Returned", "ReturnRejected"]; // Admin can change to these

const OrderHistory = () => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [currentTab, setCurrentTab] = useState(0); // 0 for All Orders, 1 for Return Requests, 2 for Return History

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("yourAuthTokenKey"); // Ensure admin has a token too
      if (!token) {
        setError("Authentication token not found. Please log in as admin.");
        setLoading(false);
        return;
      }

      const response = await fetch('https://estore-backend-dyl3.onrender.com/api/invoice', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setInvoices(data);
      console.log("Admin - Invoices fetched:", data); // ADDED LOG
    } catch (err) {
      setError(err.message);
      console.error('Admin - Fetch invoices error:', err);
      toast.error(`Error fetching orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleOpen = (invoice) => setSelectedOrder(invoice);
  const handleClose = () => setSelectedOrder(null);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setPage(0); // Reset page when changing tabs
  };

  // Function to update order status
  const handleOrderStatusChange = async (invoiceId, newStatus) => {
    try {
      const token = localStorage.getItem("yourAuthTokenKey");
      if (!token) {
        toast.error("Authentication token not found. Please log in as admin.");
        return;
      }

      const response = await fetch(`https://estore-backend-dyl3.onrender.com/api/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }
      fetchInvoices();
      if (selectedOrder && selectedOrder._id === invoiceId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
      toast.success(`Order status updated to ${newStatus} successfully!`);
    } catch (err) {
      console.error("Admin - Order status update error:", err);
      toast.error("Failed to update status: " + err.message);
    }
  };

  // Function to update item return status (NEW)
  const handleReturnAction = async (orderId, cartItemId, newReturnStatus) => {
    try {
      const token = localStorage.getItem("yourAuthTokenKey");
      if (!token) {
        toast.error("Authentication token not found. Please log in as admin.");
        return;
      }

      const response = await fetch(
        `https://estore-backend-dyl3.onrender.com/api/invoice/order/${orderId}/item/${cartItemId}/update-return-status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newReturnStatus }),
        }
      );

      const responseData = await response.json();

      if (response.ok && responseData.order) {
        // Update the selected order in state to reflect the change immediately
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(responseData.order);
        }
        // Also refetch all invoices to update the main table
        fetchInvoices();
        toast.success("Return status updated successfully!");
      } else {
        toast.error(responseData.error || "Failed to update return status.");
        console.error("Admin - Return status update API error:", response.status, responseData);
      }
    } catch (err) {
      console.error("Admin - Error updating return status:", err);
      toast.error("A network error occurred while updating return status.");
    }
  };


  const sortedInvoices = [...invoices].sort((a, b) => {
    const valA = a[orderBy] || '';
    const valB = b[orderBy] || '';
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredInvoices = sortedInvoices.filter(invoice => {
    if (currentTab === 0) {
      return true; // All Orders
    } else if (currentTab === 1) {
      return invoice.cartItems.some(item => item.returnStatus === "ReturnRequested"); // Only orders with items having "ReturnRequested" status
    } else if (currentTab === 2) {
      return invoice.cartItems.some(item => item.returnStatus === "Returned" || item.returnStatus === "ReturnRejected"); // Only orders with items having "Returned" or "ReturnRejected" status
    }
    return false;
  });


  const paginatedInvoices = filteredInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Combined status icon getter (Order Status)
  const getCombinedStatusIcon = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'Failed' || orderStatus === 'Cancelled') return <Cancel fontSize="small" color="error" />;
    if (paymentStatus === 'Pending' && orderStatus === 'Processing') return <HourglassEmpty fontSize="small" color="warning" />;
    if (paymentStatus === 'Paid' || paymentStatus === 'Cash On Delivery') {
        switch (orderStatus?.toLowerCase()) {
            case 'processing': return <HourglassEmpty fontSize="small" color="action" />;
            case 'packaged': return <ShoppingBag fontSize="small" color="info" />;
            case 'shipped': return <LocalShipping fontSize="small" color="primary" />;
            case 'out for delivery': return <DeliveryDining fontSize="small" sx={{ color: theme.palette.warning.dark }}/>;
            case 'delivered': return <CheckCircle fontSize="small" color="success" />;
            default: return <HourglassEmpty fontSize="small" />;
        }
    }
    return <HourglassEmpty fontSize="small" />;
  };

  const getStatusChipColor = (paymentStatus, orderStatus) => {
     if (paymentStatus === 'Failed' || orderStatus === 'Cancelled') return theme.palette.error.light;
     if (paymentStatus === 'Pending' && orderStatus === 'Processing') return theme.palette.warning.light;
     if (paymentStatus === 'Paid' || paymentStatus === 'Cash On Delivery') {
        switch (orderStatus?.toLowerCase()) {
            case 'processing': return theme.palette.action.disabledBackground;
            case 'packaged': return theme.palette.info.light;
            case 'shipped': return theme.palette.primary.light;
            case 'out for delivery': return theme.palette.warning.dark;
            case 'delivered': return theme.palette.success.light;
            default: return theme.palette.grey[400];
        }
    }
    return theme.palette.grey[400];
  };

  // Display combined status label
  const getCombinedStatusLabel = (paymentStatus, orderStatus, paymentMethod) => {
    if (paymentStatus === 'Failed') return 'Payment Failed';
    if (orderStatus === 'Cancelled') return 'Order Cancelled';

    if (paymentMethod === 'cod' && paymentStatus === 'Pending' && orderStatus === 'Processing') {
        return 'Pending Confirmation (COD)';
    }
    if (paymentStatus === 'Paid' || (paymentMethod === 'cod' && paymentStatus !== 'Pending')) {
        return orderStatus?.charAt(0).toUpperCase() + orderStatus?.slice(1);
    }
    return paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Pending';
  };

  // Return Status related helpers (NEW)
  const getReturnStatusChipColor = (returnStatus) => {
    switch(returnStatus) {
        case "ReturnRequested": return theme.palette.warning.main;
        case "Returned": return theme.palette.success.main;
        case "ReturnRejected": return theme.palette.error.main;
        default: return theme.palette.grey[500];
    }
  };

  const getReturnStatusIcon = (returnStatus) => {
    switch(returnStatus) {
        case "ReturnRequested": return <AssignmentReturn fontSize="small" sx={{ color: 'white' }}/>;
        case "Returned": return <CheckCircle fontSize="small" sx={{ color: 'white' }}/>;
        case "ReturnRejected": return <Cancel fontSize="small" sx={{ color: 'white' }}/>;
        default: return <Undo fontSize="small" sx={{ color: 'white' }}/>;
    }
  };


  if (loading && invoices.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.palette.background.default }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 4, background: theme.palette.background.default, textAlign: 'center' }}>
            <Typography variant="h5" color="error" gutterBottom>Error Loading Orders</Typography>
            <Typography sx={{ mb: 3 }}>{error}</Typography>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => fetchInvoices()} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>Retry</Button>
            </motion.div>
        </Box>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.palette.background.default }}>
            <Typography variant="h5">No orders found. Start shopping!</Typography>
        </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh', background: theme.palette.background.default }}>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4, textAlign: 'left', fontSize: { xs: '1.8rem', sm: '2.2rem' }}}>
        Order History
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', mb: 4 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="order history tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', background: theme.palette.background.paper }}>
          <Tab label="All Orders" />
          <Tab label="Return Requests" />
          <Tab label="Return History" />
        </Tabs>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {currentTab === 0 ? "All Recent Orders" :
             currentTab === 1 ? "Pending Return Requests" :
             "Completed Return History"}
          </Typography>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ background: theme.palette.background.paper }}>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleRequestSort('_id')}>
                    Order ID {orderBy === '_id' && (order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />)}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleRequestSort('createdAt')}>
                    Date {orderBy === 'createdAt' && (order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />)}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', cursor: 'pointer' }} onClick={() => handleRequestSort('grandTotal')}>
                    Total {orderBy === 'grandTotal' && (order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />)}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Order Status</TableCell>
                {currentTab === 0 && (
                    <TableCell sx={{ fontWeight: 600 }} align="center">Update Order Status</TableCell>
                )}
                {(currentTab === 1 || currentTab === 2) && (
                    <TableCell sx={{ fontWeight: 600 }} align="center">Return Summary</TableCell>
                )}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, background: theme.palette.background.paper }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>#{invoice._id?.slice(-6).toUpperCase()}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: theme.palette.primary.main, fontSize: '0.875rem' }}>
                        {invoice.billingData?.firstName?.charAt(0)}{invoice.billingData?.lastName?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {invoice.billingData?.firstName} {invoice.billingData?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.billingData?.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{new Date(invoice.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>{invoice.cartItems?.length}</Typography>
                      <Tooltip title={invoice.cartItems?.map(item => item.name).join(', ')}>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.cartItems?.[0]?.name}{invoice.cartItems?.length > 1 ? ` +${invoice.cartItems.length - 1}` : ''}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>€{invoice.grandTotal?.toFixed(2)}</Typography></TableCell>

                  <TableCell align="center">
                    <Chip
                      icon={getCombinedStatusIcon(invoice.paymentStatus, invoice.orderStatus)}
                      label={getCombinedStatusLabel(invoice.paymentStatus, invoice.orderStatus, invoice.paymentMethod)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusChipColor(invoice.paymentStatus, invoice.orderStatus),
                        color: theme.palette.getContrastText(getStatusChipColor(invoice.paymentStatus, invoice.orderStatus)),
                        fontWeight: 500,
                        minWidth: 130,
                      }}
                    />
                  </TableCell>

                  {currentTab === 0 && (
                      <TableCell align="center">
                        { invoice.orderStatus !== 'Delivered' && invoice.orderStatus !== 'Cancelled' && (invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Cash On Delivery') ? (
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel id={`status-select-label-${invoice._id}`}>Update</InputLabel>
                            <Select
                                labelId={`status-select-label-${invoice._id}`}
                                value={invoice.orderStatus || ''}
                                label="Update"
                                onChange={(e) => handleOrderStatusChange(invoice._id, e.target.value)}
                            >
                                {ORDER_STATUSES.filter(status => status !== "Cancelled").map((status) => (
                                <MenuItem key={status} value={status}>
                                    {status}
                                </MenuItem>
                                ))}
                            </Select>
                            </FormControl>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                {invoice.orderStatus === 'Delivered' ? 'Completed' : invoice.orderStatus === 'Cancelled' ? 'Cancelled' : 'N/A'}
                            </Typography>
                        )}
                      </TableCell>
                  )}

                  {(currentTab === 1 || currentTab === 2) && (
                      <TableCell align="center">
                          {invoice.cartItems && invoice.cartItems.some(item =>
                              (currentTab === 1 && item.returnStatus === "ReturnRequested") ||
                              (currentTab === 2 && (item.returnStatus === "Returned" || item.returnStatus === "ReturnRejected"))
                          ) ? (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                  {invoice.cartItems.filter(item =>
                                      (currentTab === 1 && item.returnStatus === "ReturnRequested") ||
                                      (currentTab === 2 && (item.returnStatus === "Returned" || item.returnStatus === "ReturnRejected"))
                                  ).map((item) => (
                                      <Chip
                                          key={item._id}
                                          icon={getReturnStatusIcon(item.returnStatus)}
                                          label={`${item.name.substring(0, 10)}${item.name.length > 10 ? '...' : ''}: ${item.returnStatus}`}
                                          size="small"
                                          sx={{
                                              mb: 0.5,
                                              backgroundColor: getReturnStatusChipColor(item.returnStatus),
                                              color: 'white',
                                              fontWeight: 500,
                                          }}
                                      />
                                  ))}
                              </Box>
                          ) : (
                              <Typography variant="caption" color="text.secondary">N/A</Typography>
                          )}
                      </TableCell>
                  )}


                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton onClick={() => handleOpen(invoice)} size="small" sx={{ color: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.light }}}>
                        <Receipt fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {invoice.orderStatus !== 'Delivered' && invoice.orderStatus !== 'Cancelled' && (
                        <Tooltip title="Cancel Order">
                            <IconButton onClick={() => handleOrderStatusChange(invoice._id, "Cancelled")} size="small" sx={{ color: theme.palette.error.main, '&:hover': { backgroundColor: theme.palette.error.light }}}>
                                <Cancel fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredInvoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}
        />
      </Paper>

      {/* Order Details Modal - MODIFIED to show orderStatus and return details */}
      {selectedOrder && (
        <Paper
          sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 }, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}>
            <Paper sx={{ width: { xs: '100%', sm: '800px' }, maxHeight: '90vh', overflow: 'auto', borderRadius: 2, position: 'relative', boxShadow: theme.shadows[10], p: 4 }}>
              <IconButton onClick={handleClose} sx={{ position: 'absolute', right: 16, top: 16, zIndex: 1 }}>
                <Cancel />
              </IconButton>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>Order Details</Typography>
                <Typography variant="subtitle1" color="text.secondary">#{selectedOrder._id?.slice(-6).toUpperCase()}</Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Customer Information</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ p: 3, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: theme.palette.primary.main, fontSize: '1.25rem' }}>
                            {selectedOrder.billingData?.firstName?.charAt(0)}{selectedOrder.billingData?.lastName?.charAt(0)}
                            </Avatar>
                            <Box>
                            <Typography sx={{ fontWeight: 600 }}>{selectedOrder.billingData?.firstName} {selectedOrder.billingData?.lastName}</Typography>
                            <Chip
                                icon={getCombinedStatusIcon(selectedOrder.paymentStatus, selectedOrder.orderStatus)}
                                label={getCombinedStatusLabel(selectedOrder.paymentStatus, selectedOrder.orderStatus, selectedOrder.paymentMethod)}
                                size="small"
                                sx={{
                                    mt:1,
                                    backgroundColor: getStatusChipColor(selectedOrder.paymentStatus, selectedOrder.orderStatus),
                                    color: 'white',
                                    fontWeight: 500
                                }}
                            />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {selectedOrder.billingData?.email || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Phone:</strong> {selectedOrder.billingData?.phone || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                            <Typography variant="body2"><strong>Current Order Status:</strong> {selectedOrder.orderStatus || "N/A"}</Typography>
                        </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                   <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Payment Summary</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ p: 3, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">€{(selectedOrder.grandTotal - (selectedOrder.shippingFee || 0))?.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2">Shipping:</Typography>
                                <Typography variant="body2">€{selectedOrder.shippingFee?.toFixed(2) || '0.00'}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>€{selectedOrder.grandTotal?.toFixed(2)}</Typography>
                            </Box>
                             <Box sx={{ mt: 3 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Payment Method:</strong> {selectedOrder.paymentMethod === 'cod' ? 'Cash On Delivery' : (selectedOrder.paymentMethod || 'Razorpay')}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Payment Status:</strong> {selectedOrder.paymentStatus || 'N/A'}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Order Items ({selectedOrder.cartItems?.length || 0})</Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                  <Table size="small">
                    <TableHead sx={{ background: theme.palette.background.default }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Price</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">Qty</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.cartItems?.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                            <Typography variant="caption" color="text.secondary">SKU: {item._id?.slice(-6) || 'N/A'}</Typography>
                            {/* Display Return Status Here */}
                            {item.returnStatus && item.returnStatus !== "NotReturned" && (
                                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                    <Chip
                                        icon={getReturnStatusIcon(item.returnStatus)}
                                        label={`Return: ${item.returnStatus}`}
                                        size="small"
                                        sx={{
                                            backgroundColor: getReturnStatusChipColor(item.returnStatus),
                                            color: 'white',
                                            fontWeight: 500,
                                            width: 'fit-content'
                                        }}
                                    />
                                    {item.returnReason && (
                                        <Typography variant="caption" display="block" sx={{ mt: 0.2, color: theme.palette.text.secondary }}>
                                            Reason: {item.returnReason}
                                        </Typography>
                                    )}
                                    {item.returnDetails && (
                                        <Typography variant="caption" display="block" sx={{ mt: 0.1, color: theme.palette.text.secondary }}>
                                            Details: {item.returnDetails}
                                        </Typography>
                                    )}
                                    {/* Admin Action for Return Status (NEW) */}
                                    {item.returnStatus === "ReturnRequested" && (
                                        <Box sx={{ mt: 1 }}>
                                            <FormControl size="small" fullWidth>
                                                <InputLabel id={`return-status-label-${item._id}`}>Action Return</InputLabel>
                                                <Select
                                                    labelId={`return-status-label-${item._id}`}
                                                    value={""} // No default selection, forces user to pick
                                                    label="Action Return"
                                                    onChange={(e) => handleReturnAction(selectedOrder._id, item._id, e.target.value)}
                                                >
                                                    {ADMIN_RETURN_STATUSES.map((status) => (
                                                        <MenuItem key={status} value={status}>
                                                            {status}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    )}
                                </Box>
                            )}
                          </TableCell>
                          <TableCell align="right"><Typography variant="body2">€{(item.discountedPrice || item.price)?.toFixed(2)}</Typography></TableCell>
                          <TableCell align="center"><Typography variant="body2">{item.quantity}</Typography></TableCell>
                          <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>€{((item.discountedPrice || item.price) * item.quantity).toFixed(2)}</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button onClick={handleClose} variant="contained" color="primary" sx={{ minWidth: 120 }}>Close</Button>
              </Box>
            </Paper>
          </motion.div>
        </Paper>
      )}
    </Box>
  );
};

export default OrderHistory;