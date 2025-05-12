'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Divider, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, IconButton, Chip, useTheme, CircularProgress,
  TablePagination, Tooltip, Button, Stack, Avatar,Grid
} from '@mui/material';
import { 
  Receipt, ArrowDownward, ArrowUpward, FilterList, Search, 
  Paid, Pending, Cancel, LocalShipping, DoneAll 
} from '@mui/icons-material';
import { motion } from 'framer-motion';

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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
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
    };

    fetchInvoices();
  }, []);

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

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[orderBy] > b[orderBy]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const paginatedInvoices = sortedInvoices.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
      return <Paid fontSize="small" color="success" />;
    case 'cash on delivery':
      return <Pending fontSize="small" color="warning" />; // COD shows as pending
    case 'pending':
      return <Pending fontSize="small" color="warning" />;
    case 'cancelled':
      return <Cancel fontSize="small" color="error" />;
    case 'shipped':
      return <LocalShipping fontSize="small" color="info" />;
    case 'completed':
      return <DoneAll fontSize="small" color="success" />;
    default:
      return <Pending fontSize="small" />;
  }
};


  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: theme.palette.background.default
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        p: 4,
        background: theme.palette.background.default,
        textAlign: 'center'
      }}>
        <Typography variant="h5" color="error" gutterBottom>
          Error Loading Orders
        </Typography>
        <Typography sx={{ mb: 3 }}>{error}</Typography>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={() => window.location.reload()}
            variant="contained"
            color="primary"
            sx={{ fontWeight: 'bold' }}
          >
            Retry
          </Button>
        </motion.div>
      </Box>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: theme.palette.background.default
      }}>
        <Typography variant="h5">
          No orders found. Start shopping!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 4 },
      minHeight: '100vh',
      background: theme.palette.background.default,
    }}>
      <Typography variant="h4" gutterBottom sx={{
        fontWeight: 700,
        color: theme.palette.text.primary,
        mb: 4,
        textAlign: 'left',
        fontSize: { xs: '1.8rem', sm: '2.2rem' }
      }}>
        Order History
      </Typography>

      <Paper elevation={0} sx={{ 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        mb: 4
      }}>
        <Box sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: theme.palette.background.paper
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Recent Orders
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Search">
              <IconButton>
                <Search fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter">
              <IconButton>
                <FilterList fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ background: theme.palette.background.paper }}>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRequestSort('_id')}
                  >
                    Order ID
                    {orderBy === '_id' && (
                      order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRequestSort('createdAt')}
                  >
                    Date
                    {orderBy === 'createdAt' && (
                      order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleRequestSort('grandTotal')}
                  >
                    Total
                    {orderBy === 'grandTotal' && (
                      order === 'asc' ? <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                      <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInvoices.map((invoice) => (
                <TableRow
                  key={invoice._id}
                  hover
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    background: theme.palette.background.paper
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      #{invoice._id?.slice(-6).toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 2,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '0.875rem'
                      }}>
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
                  <TableCell>
                    {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {invoice.cartItems?.length}
                      </Typography>
                      <Tooltip title={invoice.cartItems?.map(item => item.name).join(', ')}>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.cartItems?.[0]?.name}
                          {invoice.cartItems?.length > 1 ? ` +${invoice.cartItems.length - 1}` : ''}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ₹{invoice.grandTotal?.toFixed(2)}
                    </Typography>
                  </TableCell>
                
<TableCell align="center">
  <Chip
    icon={getStatusIcon(invoice.paymentStatus)}
    label={
      invoice.paymentStatus === 'Cash On Delivery' ? 'Pending' : 
      invoice.paymentStatus?.charAt(0).toUpperCase() + invoice.paymentStatus?.slice(1)
    }
    size="small"
    sx={{
      backgroundColor: 
        invoice.paymentStatus === 'paid' ? theme.palette.success.light :
        invoice.paymentStatus === 'Cash On Delivery' || invoice.paymentStatus === 'pending' ? theme.palette.warning.light :
        invoice.paymentStatus === 'cancelled' ? theme.palette.error.light :
        theme.palette.info.light,
      color: 'white',
      fontWeight: 500,
      minWidth: 90
    }}
  />
</TableCell>


                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton 
                        onClick={() => handleOpen(invoice)}
                        size="small"
                        sx={{
                          color: theme.palette.primary.main,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light
                          }
                        }}
                      >
                        <Receipt fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
          sx={{ 
            borderTop: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.paper
          }}
        />
      </Paper>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Paper
          open={Boolean(selectedOrder)}
          onClose={handleClose}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, sm: 4 },
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <Paper sx={{
              width: { xs: '100%', sm: '800px' },
              maxHeight: '90vh',
              overflow: 'auto',
              borderRadius: 2,
              position: 'relative',
              boxShadow: theme.shadows[10],
              p: 4
            }}>
              <IconButton
                onClick={handleClose}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  zIndex: 1,
                }}
              >
                <Cancel />
              </IconButton>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                  Order Details
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  #{selectedOrder._id?.slice(-6).toUpperCase()}
                </Typography>
              </Box>

              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Customer Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ 
                          width: 56, 
                          height: 56, 
                          mr: 2,
                          bgcolor: theme.palette.primary.main,
                          fontSize: '1.25rem'
                        }}>
                          {selectedOrder.billingData?.firstName?.charAt(0)}{selectedOrder.billingData?.lastName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {selectedOrder.billingData?.firstName} {selectedOrder.billingData?.lastName}
                          </Typography>
                      
<Chip
  icon={getStatusIcon(selectedOrder.paymentStatus)}
  label={
    selectedOrder.paymentStatus === 'Cash On Delivery' ? 'Pending' : 
    selectedOrder.paymentStatus?.charAt(0).toUpperCase() + selectedOrder.paymentStatus?.slice(1)
  }
  size="small"
  sx={{
    mt: 1,
    backgroundColor: 
      selectedOrder.paymentStatus === 'paid' ? theme.palette.success.light :
      selectedOrder.paymentStatus === 'Cash On Delivery' || selectedOrder.paymentStatus === 'pending' ? theme.palette.warning.light :
      selectedOrder.paymentStatus === 'cancelled' ? theme.palette.error.light :
      theme.palette.info.light,
    color: 'white',
    fontWeight: 500
  }}
/>

                        </Box>
                      </Box>
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Email:</strong> {selectedOrder.billingData?.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Phone:</strong> {selectedOrder.billingData?.phone || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                      Payment Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ 
                      p: 3,
                      borderRadius: 1,
                      border: `1px solid ${theme.palette.divider}`,
                      background: theme.palette.background.paper
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1.5
                      }}>
                        <Typography variant="body2">Subtotal:</Typography>
                        <Typography variant="body2">
                          ₹{(selectedOrder.grandTotal - selectedOrder.shippingFee)?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        mb: 1.5
                      }}>
                        <Typography variant="body2">Shipping:</Typography>
                        <Typography variant="body2">₹{selectedOrder.shippingFee?.toFixed(2)}</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                          ₹{selectedOrder.grandTotal?.toFixed(2)}
                        </Typography>
                      </Box>
                      <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>
  <strong>Payment Method:</strong> 
  {selectedOrder.paymentMethod === 'Cash On Delivery' ? 'Cash On Delivery (Pending)' : selectedOrder.paymentMethod || 'Razorpay'}
</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Order Items ({selectedOrder.cartItems?.length || 0})
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${theme.palette.divider}` }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ background: theme.palette.background.default }}>
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
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {item._id?.slice(-6) || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              ₹{item.discountedPrice?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              ₹{(item.discountedPrice * item.quantity).toFixed(2)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button 
                  onClick={handleClose}
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 120 }}
                >
                  Close
                </Button>
              </Box>
            </Paper>
          </motion.div>
        </Paper>
      )}
    </Box>
  );
};

export default OrderHistory;