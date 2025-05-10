'use client';

import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Divider, 
  Modal, IconButton, Grid, useTheme, CircularProgress
} from '@mui/material';
import { motion } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import ReceiptIcon from '@mui/icons-material/Receipt';

const OrderHistory = () => {
  const theme = useTheme();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
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
          <Box
            onClick={() => window.location.reload()}
            sx={{
              px: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Retry
          </Box>
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
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'
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
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)',
    }}>
      <Typography variant="h4" gutterBottom sx={{
        fontWeight: 700,
        color: theme.palette.primary.dark,
        mb: 4,
        textAlign: 'center',
        fontSize: { xs: '1.8rem', sm: '2.2rem' }
      }}>
        Order History
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        {invoices.map((invoice, index) => (
          <Grid item key={invoice._id || index} sx={{
            width: { xs: '100%', sm: '280px', md: '240px', lg: '220px', xl: '200px' },
            minWidth: { xs: '100%', sm: '280px', md: '240px', lg: '220px', xl: '200px' },
            maxWidth: { xs: '100%', sm: '280px', md: '240px', lg: '220px', xl: '200px' },
            flex: '0 0 auto'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card sx={{
                height: '400px', // Fixed height
                width: '100%', // Takes full width of Grid item
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
                },
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    mb: 1,
                    minHeight: '24px'
                  }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      Order #{invoice._id?.slice(-6).toUpperCase() || 'N/A'}
                    </Typography>
                    <Box sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      bgcolor: invoice.paymentStatus === 'paid' ? 
                        'success.light' : 'error.light',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      flexShrink: 0
                    }}>
                      {invoice.paymentStatus?.toUpperCase() || 'PENDING'}
                    </Box>
                  </Box>

                  <Typography variant="h6" sx={{ 
                    mb: 1, 
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {invoice.billingData?.firstName || 'Customer'} {invoice.billingData?.lastName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {new Date(invoice.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>

                  <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.08)' }} />

                  <Box sx={{ 
                    mb: 2,
                    flexGrow: 1,
                    overflow: 'hidden',
                    minHeight: '100px'
                  }}>
                    <Box sx={{
                      maxHeight: '100px',
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.grey[400],
                        borderRadius: '2px',
                      }
                    }}>
                      {invoice.cartItems?.slice(0, 4).map((item, idx) => (
                        <Typography key={idx} variant="body2" sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          py: 0.5,
                          fontSize: '0.9rem'
                        }}>
                          <span style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '60%'
                          }}>
                            {item.name} × {item.quantity}
                          </span>
                          <span>₹{item.discountedPrice?.toFixed(2)}</span>
                        </Typography>
                      ))}
                      {invoice.cartItems?.length > 4 && (
                        <Typography variant="caption" color="text.secondary">
                          +{invoice.cartItems.length - 4} more items
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ 
                    mt: 'auto',
                    pt: 1,
                    fontWeight: 'bold',
                    textAlign: 'right'
                  }}>
                    Total: ₹{invoice.grandTotal?.toFixed(2)}
                  </Typography>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Box
                      onClick={() => handleOpen(invoice)}
                      sx={{
                        width: '100%',
                        py: 1.5,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                        color: 'white',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                        }
                      }}
                    >
                      <ReceiptIcon fontSize="small" />
                      <Typography variant="button" sx={{ fontSize: '0.8rem' }}>
                        View Details
                      </Typography>
                    </Box>
                  </motion.div>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Order Details Modal (unchanged) */}
      <Modal
        open={Boolean(selectedOrder)}
        onClose={handleClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        >
          <Card sx={{
            width: { xs: '95vw', sm: '600px' },
            maxHeight: '90vh',
            overflow: 'auto',
            borderRadius: 4,
            position: 'relative',
            border: 'none',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 16,
                top: 16,
                zIndex: 1,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              <CloseIcon />
            </IconButton>

            {selectedOrder && (
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Order Details
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    #{selectedOrder._id?.slice(-6).toUpperCase() || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                  }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Customer Information
                    </Typography>
                    <Box sx={{
                      px: 2,
                      py: 0.5,
                      borderRadius: 4,
                      bgcolor: selectedOrder.paymentStatus === 'paid' ? 
                        'success.light' : 'error.light',
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ 
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(245, 245, 245, 0.6)',
                    mb: 2
                  }}>
                    <Typography sx={{ fontWeight: 500 }}>
                      {selectedOrder.billingData?.firstName} {selectedOrder.billingData?.lastName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      ✉️ {selectedOrder.billingData?.email || 'No email provided'}
                    </Typography>
                    <Typography color="text.secondary">
                      📱 {selectedOrder.billingData?.phone || 'No phone provided'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Order Items ({selectedOrder.cartItems?.length || 0})
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    {selectedOrder.cartItems?.map((item, idx) => (
                      <Box key={idx} sx={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: idx % 2 === 0 ? 'background.paper' : 'rgba(0, 0, 0, 0.02)',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' }
                      }}>
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                        <Typography fontWeight="bold">
                          ₹{item.discountedPrice?.toFixed(2)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'rgba(25, 118, 210, 0.05)',
                  border: '1px solid',
                  borderColor: 'rgba(25, 118, 210, 0.1)'
                }}>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>
                      ₹{(selectedOrder.grandTotal - selectedOrder.shippingFee)?.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}>
                    <Typography>Shipping:</Typography>
                    <Typography>₹{selectedOrder.shippingFee?.toFixed(2)}</Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h5" color="primary" fontWeight="bold">
                      ₹{selectedOrder.grandTotal?.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Ordered on: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payment method: {selectedOrder.paymentMethod || 'Razorpay'}
                  </Typography>
                </Box>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </Modal>
    </Box>
  );
};

export default OrderHistory;