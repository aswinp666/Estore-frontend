'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Chip, useTheme, CircularProgress,
  TablePagination, Tooltip, Button, Stack, Avatar, Grid,
  Select, MenuItem, FormControl, InputLabel // Added for status dropdown
} from '@mui/material';
import { 
  Receipt, ArrowDownward, ArrowUpward, FilterList, Search, 
  Paid, Pending, Cancel, LocalShipping, DoneAll, HourglassEmpty, ShoppingBag, DeliveryDining, CheckCircle
} from '@mui/icons-material'; // Added more icons
import { motion } from 'framer-motion';

// Define Order Statuses consistently
const ORDER_STATUSES = ["Processing", "Packaged", "Shipped", "Out For Delivery", "Delivered", "Cancelled"];

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

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      // Ensure this API endpoint is correct and returns 'orderStatus' and 'paymentMethod'
      const response = await fetch('https://estore-backend-dyl3.onrender.com/api/invoice');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array, fetchInvoices itself doesn't change

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]); // fetchInvoices is now a dependency


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

  // Function to update order status
  const handleOrderStatusChange = async (invoiceId, newStatus) => {
    try {
      const response = await fetch(`https://estore-backend-dyl3.onrender.com/api/invoice/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      // Refresh invoices list to show the updated status
      fetchInvoices();
      // If the detailed modal is open for this order, update its status too
      if (selectedOrder && selectedOrder._id === invoiceId) {
        setSelectedOrder(prev => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status. Please try again."); // Simple alert for now
    }
  };


  const sortedInvoices = [...invoices].sort((a, b) => {
    // Handle potential undefined values for sorting keys
    const valA = a[orderBy] || '';
    const valB = b[orderBy] || '';
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedInvoices = sortedInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Combined status icon getter
  const getCombinedStatusIcon = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'Failed' || orderStatus === 'Cancelled') return <Cancel fontSize="small" color="error" />;
    if (paymentStatus === 'Pending' && orderStatus === 'Processing') return <HourglassEmpty fontSize="small" color="warning" />; // For COD pending confirmation
    if (paymentStatus === 'Paid' || paymentStatus === 'Cash On Delivery') { // Paid or COD confirmed
        switch (orderStatus?.toLowerCase()) {
            case 'processing': return <HourglassEmpty fontSize="small" color="action" />;
            case 'packaged': return <ShoppingBag fontSize="small" color="info" />;
            case 'shipped': return <LocalShipping fontSize="small" color="primary" />;
            case 'out for delivery': return <DeliveryDining fontSize="small" style={{ color: theme.palette.warning.dark }}/>;
            case 'delivered': return <CheckCircle fontSize="small" color="success" />;
            default: return <Pending fontSize="small" />;
        }
    }
    return <Pending fontSize="small" />; // Default fallback
  };
  
  const getStatusChipColor = (paymentStatus, orderStatus) => {
     if (paymentStatus === 'Failed' || orderStatus === 'Cancelled') return theme.palette.error.light;
     if (paymentStatus === 'Pending' && orderStatus === 'Processing') return theme.palette.warning.light; // For COD pending confirmation
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
    // Default or other pending states
    return paymentStatus?.charAt(0).toUpperCase() + paymentStatus?.slice(1) || 'Pending';
  };


  if (loading && invoices.length === 0) { // Show loader only if invoices are not yet loaded
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.palette.background.default }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return ( /* Error UI as before */
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
    return ( /* No orders UI as before */
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: theme.palette.background.default }}>
            <Typography variant="h5">No orders found. Start shopping!</Typography>
        </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, minHeight: '100vh', background: theme.palette.background.default }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 4, textAlign: 'left', fontSize: { xs: '1.8rem', sm: '2.2rem' }}}>
        Order History
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden', mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Orders</Typography>
          {/* Search/Filter Icons as before */}
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 750 }}> {/* Increased minWidth for new column */}
            <TableHead>
              <TableRow sx={{ background: theme.palette.background.paper }}>
                {/* Table Headers as before, add one for Order Status Action */}
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
                <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Update Status</TableCell> {/* New Column */}
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow key={invoice._id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 }, background: theme.palette.background.paper }}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>#{invoice._id?.slice(-6).toUpperCase()}</Typography>
                  </TableCell>
                  <TableCell> {/* Customer Cell as before */}
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
                  <TableCell> {/* Items Cell as before */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>{invoice.cartItems?.length}</Typography>
                      <Tooltip title={invoice.cartItems?.map(item => item.name).join(', ')}>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.cartItems?.[0]?.name}{invoice.cartItems?.length > 1 ? ` +${invoice.cartItems.length - 1}` : ''}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 600 }}>₹{invoice.grandTotal?.toFixed(2)}</Typography></TableCell>
                  
                  {/* Status Chip - Updated */}
                  <TableCell align="center">
                    <Chip
                      icon={getCombinedStatusIcon(invoice.paymentStatus, invoice.orderStatus)}
                      label={getCombinedStatusLabel(invoice.paymentStatus, invoice.orderStatus, invoice.paymentMethod)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusChipColor(invoice.paymentStatus, invoice.orderStatus),
                        color: theme.palette.getContrastText(getStatusChipColor(invoice.paymentStatus, invoice.orderStatus)), // Ensure text is readable
                        fontWeight: 500,
                        minWidth: 130, // Adjust as needed
                      }}
                    />
                  </TableCell>

                  {/* Order Status Update Dropdown - NEW */}
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
                            {ORDER_STATUSES.filter(status => status !== "Cancelled").map((status) => ( // Exclude "Cancelled" here, handle separately if needed
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

                  <TableCell align="right"> {/* Actions Cell as before */}
                    <Tooltip title="View details">
                      <IconButton onClick={() => handleOpen(invoice)} size="small" sx={{ color: theme.palette.primary.main, '&:hover': { backgroundColor: theme.palette.primary.light }}}>
                        <Receipt fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {/* Potentially add a cancel order button here if applicable */}
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
          count={invoices.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ borderTop: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper }}
        />
      </Paper>

      {/* Order Details Modal - MODIFIED to show orderStatus */}
      {selectedOrder && (
        <Paper // Using Paper as a modal container
          open={Boolean(selectedOrder)} // This prop is for Modal, Paper doesn't use it directly
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
                <Grid item xs={12} md={6}> {/* Customer Info */}
                    {/* ... (Customer Info as before, but update the status chip) ... */}
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
                            {/* Updated Status Chip in Modal */}
                            <Chip
                                icon={getCombinedStatusIcon(selectedOrder.paymentStatus, selectedOrder.orderStatus)}
                                label={getCombinedStatusLabel(selectedOrder.paymentStatus, selectedOrder.orderStatus, selectedOrder.paymentMethod)}
                                size="small"
                                sx={{
                                    mt:1,
                                    backgroundColor: getStatusChipColor(selectedOrder.paymentStatus, selectedOrder.orderStatus),
                                    color: 'white', // Assuming white text works for these background
                                    fontWeight: 500
                                }}
                            />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Email:</strong> {selectedOrder.billingData?.email || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Phone:</strong> {selectedOrder.billingData?.phone || 'N/A'}</Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</Typography>
                            <Typography variant="body2"><strong>Current Order Status:</strong> {selectedOrder.orderStatus || "N/A"}</Typography> {/* Display Order Status */}
                        </Box>
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}> {/* Payment Summary */}
                  {/* ... (Payment Summary as before) ... */}
                   <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>Payment Summary</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ p: 3, borderRadius: 1, border: `1px solid ${theme.palette.divider}`, background: theme.palette.background.paper}}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2">Subtotal:</Typography>
                                <Typography variant="body2">₹{(selectedOrder.grandTotal - (selectedOrder.shippingFee || 0))?.toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography variant="body2">Shipping:</Typography>
                                <Typography variant="body2">₹{selectedOrder.shippingFee?.toFixed(2) || '0.00'}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
                                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>₹{selectedOrder.grandTotal?.toFixed(2)}</Typography>
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
              {/* Order Items Table as before */}
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
                          </TableCell>
                          <TableCell align="right"><Typography variant="body2">₹{item.discountedPrice?.toFixed(2)}</Typography></TableCell>
                          <TableCell align="center"><Typography variant="body2">{item.quantity}</Typography></TableCell>
                          <TableCell align="right"><Typography variant="body2" sx={{ fontWeight: 500 }}>₹{(item.discountedPrice * item.quantity).toFixed(2)}</Typography></TableCell>
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