"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import jsPDF from "jspdf";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import Billing from "./Billing";
import { Snackbar, Alert, Button, Box, Typography, Stepper, Step, StepLabel, CircularProgress, StepConnector, stepConnectorClasses, styled } from "@mui/material";
import { Check } from "@mui/icons-material"; // For custom step icon

// Define Order Statuses
const ORDER_STATUSES = ["Processing", "Packaged", "Shipped", "Out For Delivery", "Delivered"];

// Custom Connector for Stepper
const QontoConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: theme.palette.primary.main,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

// Custom Step Icon
const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: theme.palette.primary.main,
    }),
    '& .QontoStepIcon-completedIcon': {
      color: theme.palette.primary.main,
      zIndex: 1,
      fontSize: 18,
    },
    '& .QontoStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function QontoStepIcon(props: any) {
  const { active, completed, className } = props;
  return (
    <QontoStepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="QontoStepIcon-completedIcon" />
      ) : (
        <div className="QontoStepIcon-circle" />
      )}
    </QontoStepIconRoot>
  );
}


const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const shippingFee = totalPrice * 0.002;
  const grandTotal = totalPrice + shippingFee;

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [invoicePDF, setInvoicePDF] = useState<jsPDF | null>(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const [billingData, setBillingData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    country: "India",
    address: "",
    addressTwo: "",
    town: "",
    phone: "",
    email: "",
  });

  // New states for payment success and order tracking
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [currentOrderStatus, setCurrentOrderStatus] = useState("Processing");
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [loadingOrderStatus, setLoadingOrderStatus] = useState(false);

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Effect to fetch order status if payment was successful and order ID is known
  // This will also be triggered if the order status is updated elsewhere (e.g., admin panel)
  // For true real-time, you'd use WebSockets or Server-Sent Events.
  // Polling is a simpler alternative for now.
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (paymentSuccessful && currentOrderId) {
      const fetchStatus = async () => {
        setLoadingOrderStatus(true);
        try {
          // Ensure this matches your backend route for fetching a single invoice/order
          const res = await fetch(`https://estore-backend-dyl3.onrender.com/api/invoice/${currentOrderId}`);
          if (!res.ok) {
            throw new Error('Failed to fetch order status');
          }
          const data = await res.json();
          if (data.orderStatus) {
            setCurrentOrderStatus(data.orderStatus);
          }
        } catch (err) {
          console.error("Error fetching order status:", err);
          // Optionally show a toast for fetching error
        } finally {
          setLoadingOrderStatus(false);
        }
      };

      fetchStatus(); // Initial fetch
      intervalId = setInterval(fetchStatus, 30000); // Poll every 30 seconds
    }
    return () => clearInterval(intervalId); // Cleanup on component unmount or when orderId changes
  }, [paymentSuccessful, currentOrderId]);


  const showToast = (message: string, severity: "success" | "error" | "warning" | "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const generateInvoicePDF = async (paymentStatusForPDF: "Paid" | "Cash On Delivery", orderId: string) => {
    // ... (your existing PDF generation logic)
    // Ensure you use the passed `orderId` if needed in the PDF or use the `invoiceNumber` state.
    // For this example, `invoiceNumber` state is used as per your original code.
    const pdf = new jsPDF("p", "mm", "a4");
    // const invoiceIdForPdf = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    // setInvoiceNumber(invoiceIdForPdf); // Set this based on the actual saved invoice ID from backend if possible
    // For consistency, it might be better to use the `orderId` (which is the MongoDB _id)
    setInvoiceNumber(orderId);


    // Header Section
    pdf.setFontSize(20).setTextColor(40, 53, 147).setFont("helvetica", "bold");
    pdf.text("Estore Online Shop", 105, 20, { align: "center" });
    pdf.setFontSize(14).setTextColor(0, 0, 0);
    pdf.text("TAX INVOICE", 105, 30, { align: "center" });
  
    // Invoice Info
    pdf.setFontSize(10).setFont("helvetica", "normal");
    pdf.text(`Invoice No: ${orderId}`, 15, 40); // Use actual order ID
    pdf.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 15, 45);
    pdf.text(`GSTIN: 22ABCDE1234F1Z5`, 15, 50);
  
    // Billing Info (using billingData state)
    pdf.setFontSize(12).setFont("helvetica", "bold");
    pdf.text("BILL TO:", 15, 65);
    pdf.setFontSize(10).setFont("helvetica", "normal");
    pdf.text(`${billingData.firstName} ${billingData.lastName}`, 15, 70);
    if (billingData.companyName) pdf.text(billingData.companyName, 15, 75);
    pdf.text(billingData.address, 15, 80);
    if (billingData.addressTwo) pdf.text(billingData.addressTwo, 15, 85);
    pdf.text(`${billingData.town}, ${billingData.country}`, 15, 90);
    pdf.text(`Phone: ${billingData.phone}`, 15, 95);
    pdf.text(`Email: ${billingData.email}`, 15, 100);
    
    // Payment Status Badge
    pdf.setFont("helvetica", "bold").setTextColor(255, 255, 255);
    if (paymentStatusForPDF === "Paid") {
      pdf.setFillColor(0, 128, 0); // Green for Paid
    } else {
      pdf.setFillColor(255, 165, 0); // Orange for Cash On Delivery
    }
    pdf.roundedRect(150, 60, 40, 10, 2, 2, "F");
    pdf.text(paymentStatusForPDF === "Paid" ? "PAID" : "COD", 170, 67, { align: "center" });

    // Items Table (as in your existing code)
    // ...
        // Items Table Header
    pdf.setTextColor(0, 0, 0).setFontSize(11).setFont("helvetica", "bold");
    pdf.text("No.", 15, 120);
    pdf.text("Description", 30, 120);
    pdf.text("Qty", 130, 120);
    pdf.text("Rate (₹)", 145, 120);
    pdf.text("Amount (₹)", 170, 120);
    pdf.setDrawColor(200, 200, 200).line(15, 125, 195, 125);
  
    // Items List
    let yPosition = 132;
    let itemCounter = 1;
  
    cartItems.forEach((item) => {
      if (itemCounter % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 5, 180, 10, "F");
      }
  
      const amount = (item.discountedPrice ?? item.price) * item.quantity;
      pdf.setFontSize(10).setFont("helvetica", "normal").setTextColor(0, 0, 0);
      pdf.text(itemCounter.toString(), 17, yPosition);
      pdf.text(item.name.substring(0, 30), 30, yPosition); // Ensure item.name is defined
      pdf.text(item.quantity.toString(), 130, yPosition);
      pdf.text((item.discountedPrice ?? item.price).toFixed(2), 145, yPosition);
      pdf.text(amount.toFixed(2), 170, yPosition);
  
      yPosition += 10;
      itemCounter++;
    });
  
    // Summary Section
    pdf.setDrawColor(0, 0, 0).line(130, yPosition + 5, 195, yPosition + 5);
    yPosition += 10;
  
    pdf.setFont("helvetica", "bold");
    pdf.text("Subtotal:", 150, yPosition);
    pdf.text(totalPrice.toFixed(2), 170, yPosition);
    yPosition += 8;
  
    pdf.setFont("helvetica", "normal");
    pdf.text("Shipping:", 150, yPosition);
    pdf.text(shippingFee.toFixed(2), 170, yPosition);
    yPosition += 8;
  
    pdf.line(150, yPosition + 2, 195, yPosition + 2);
    yPosition += 8;
  
    pdf.setFontSize(12).setFont("helvetica", "bold");
    pdf.text("Total :", 150, yPosition);
    pdf.text(grandTotal.toFixed(2), 170, yPosition);
    yPosition += 15;
  
    // Footer
    pdf.setFont("helvetica", "normal").setFontSize(10);
    pdf.text(`Payment Method: ${paymentStatusForPDF === "Paid" ? "Razorpay (Online)" : "Cash On Delivery"}`, 15, yPosition);
  
    pdf.setFontSize(10).setTextColor(40, 53, 147);
    pdf.text("Thank you for your business!", 105, 280, { align: "center" });
    pdf.setTextColor(100, 100, 100);
    pdf.text("Estore Online | support@estore.com | +91 9876543210", 105, 285, { align: "center" });

    return { pdf, invoiceId: orderId }; // Return the actual orderId
  };


  const downloadInvoice = () => {
    if (invoicePDF && invoiceNumber) { // Ensure invoiceNumber (orderId) is set
      invoicePDF.save(`Invoice_${invoiceNumber}.pdf`);
      // setShowDownloadButton(false); // Keep it if they might want to download again
    }
  };

  const handleSuccessfulOrderPlacement = async (
    orderData: any, // The response from your /api/invoice/save endpoint
    paymentStatusForPDF: "Paid" | "Cash On Delivery"
  ) => {
    const savedOrderId = orderData._id; // Assuming backend returns the saved document with _id
    setCurrentOrderId(savedOrderId);
    setPaymentSuccessful(true);
    setCurrentOrderStatus(orderData.orderStatus || "Processing"); // Set initial status from backend response

    const { pdf } = await generateInvoicePDF(paymentStatusForPDF, savedOrderId);
    setInvoicePDF(pdf);
    setShowDownloadButton(true); // Show download button for the invoice

    // Send email
    const pdfBlob = pdf.output("blob");
    const reader = new FileReader();
    reader.onloadend = async function () {
      try {
        const base64PDF = (reader.result as string).split(",")[1];
        const emailSubject = paymentStatusForPDF === "Paid" ? "Thank You for Your Purchase!" : "Your Order Has Been Placed!";
        const emailHtml = paymentStatusForPDF === "Paid" 
          ? `<p>Hi <strong>${billingData.firstName}</strong>,</p> <p>Thanks for shopping with us!</p> <p><strong>Amount Paid:</strong> ₹${grandTotal.toFixed(2)}</p> <p>Your order ID is ${savedOrderId}. You can track its status on our website.</p>`
          : `<p>Hi <strong>${billingData.firstName}</strong>,</p> <p>Your order has been placed successfully!</p> <p><strong>Payment Method:</strong> Cash On Delivery</p> <p><strong>Amount to Pay:</strong> ₹${grandTotal.toFixed(2)}</p> <p>Your order ID is ${savedOrderId}. You can track its status on our website.</p>`;

        await fetch("https://estore-backend-dyl3.onrender.com/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: billingData.email,
            subject: emailSubject,
            html: emailHtml,
            attachment: {
              filename: `Invoice_${savedOrderId}.pdf`,
              content: base64PDF,
            },
          }),
        });
        showToast(paymentStatusForPDF === "Paid" ? "Payment successful! Invoice sent." : "Order placed! Confirmation sent.", "success");
      } catch (error) {
        console.error("Email error:", error);
        showToast("Failed to send order confirmation email", "error");
      }
    };
    reader.readAsDataURL(pdfBlob);
  };


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic form validation
    if (!billingData.firstName || !billingData.lastName || !billingData.address || !billingData.town || !billingData.phone || !billingData.email) {
      showToast("Please fill in all required billing details.", "error");
      return;
    }
    if (cartItems.length === 0) {
        showToast("Your cart is empty.", "warning");
        return;
    }

    if (paymentMethod === "cod") {
      try {
        // Save COD order to MongoDB
        const saveRes = await fetch("https://estore-backend-dyl3.onrender.com/api/invoice/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            billingData,
            cartItems,
            shippingFee,
            grandTotal,
            paymentStatus: "Cash On Delivery", // Explicitly set
            paymentMethod: "cod",
          }),
        });

        if (!saveRes.ok) {
            const errorData = await saveRes.json();
            throw new Error(errorData.error || "Failed to save COD order");
        }
        const savedOrderData = await saveRes.json();
        await handleSuccessfulOrderPlacement(savedOrderData, "Cash On Delivery");

      } catch (err: any) {
        console.error("COD order failed", err);
        showToast(err.message || "Order placement failed. Please try again.", "error");
      }
    } else { // Razorpay
      const amountInPaise = Math.round(grandTotal * 100);
      try {
        const orderCreationRes = await fetch("https://estore-backend-dyl3.onrender.com/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountInPaise }),
        });

        if (!orderCreationRes.ok) throw new Error("Razorpay order creation failed");
        const orderDataFromRazorpay = await orderCreationRes.json();

        const options = {
          key: "rzp_test_0rqSTvIDKUiY3m", // Replace with your actual key
          amount: orderDataFromRazorpay.amount,
          currency: "INR",
          name: "Estore Online",
          description: "Order Payment",
          order_id: orderDataFromRazorpay.id,
          handler: async function (response: any) {
            // Payment successful, now save to DB
            try {
              const saveRes = await fetch("https://estore-backend-dyl3.onrender.com/api/invoice/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  billingData,
                  cartItems,
                  shippingFee,
                  grandTotal,
                  paymentStatus: "Paid", // Explicitly set
                  paymentMethod: "razorpay",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              if (!saveRes.ok) {
                const errorData = await saveRes.json();
                throw new Error(errorData.error || "Failed to save invoice after payment");
              }
              const savedOrderData = await saveRes.json();
              await handleSuccessfulOrderPlacement(savedOrderData, "Paid");

            } catch (err: any) {
              console.error("Invoice save error after Razorpay:", err);
              showToast(err.message || "Failed to save order details after payment.", "error");
            }
          },
          prefill: {
            name: billingData.firstName + " " + billingData.lastName,
            email: billingData.email,
            contact: billingData.phone,
          },
          theme: { color: "#0d6efd" },
          modal: {
            ondismiss: function() {
              showToast("Payment was cancelled.", "warning");
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            console.error("Razorpay payment failed:", response.error);
            showToast(`Payment failed: ${response.error.description}`, "error");
             // Save failed payment attempt if needed
            fetch("https://estore-backend-dyl3.onrender.com/api/invoice/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  billingData,
                  cartItems,
                  shippingFee,
                  grandTotal,
                  paymentStatus: "Failed",
                  paymentMethod: "razorpay",
                  razorpayOrderId: orderDataFromRazorpay.id, // order_id from create-order step
                  // Include other relevant details like error code if available
                  // razorpayErrorCode: response.error.code,
                  // razorpayErrorDescription: response.error.description,
                }),
              }).catch(err => console.error("Error saving failed payment attempt:", err));
        });
        rzp.open();
      } catch (err: any) {
        console.error("Payment failed", err);
        showToast(err.message || "Payment initiation failed. Please try again.", "error");
      }
    }
  };

  // Active step for the Stepper
  const activeStep = ORDER_STATUSES.indexOf(currentOrderStatus);

  if (paymentSuccessful) {
    return (
      <>
        <Breadcrumb title={"Order Tracking"} pages={["checkout", "tracking"]} />
        <section className="overflow-hidden py-20 bg-gray-2 min-h-screen flex items-center">
          <div className="max-w-2xl w-full mx-auto px-4 sm:px-8 xl:px-0">
            <Box
              sx={{
                textAlign: 'center',
                p: { xs: 2, sm: 4 },
                background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
                borderRadius: '18px',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                backdropFilter: 'blur(4px)',
                border: '1px solid #e0e7ff',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    background: paymentMethod === "cod" ? 'linear-gradient(90deg,#16a34a,#22d3ee)' : 'linear-gradient(90deg,#2563eb,#9333ea)',
                    borderRadius: '50%',
                    width: 70,
                    height: 70,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1,
                    boxShadow: '0 4px 16px 0 rgba(59,130,246,0.12)',
                  }}
                >
                  <Check sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: paymentMethod === "cod" ? '#16a34a' : '#2563eb',
                    letterSpacing: 0.5,
                  }}
                >
                  {paymentMethod === "cod" ? "Order Placed Successfully!" : "Payment Successful!"}
                </Typography>
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 500,
                  color: '#334155',
                  mb: 1,
                  wordBreak: 'break-all',
                }}
              >
                Order ID: <span style={{ color: '#6366f1', fontWeight: 700 }}>{currentOrderId}</span>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 4,
                  color: '#64748b',
                  fontSize: { xs: 15, sm: 16 },
                }}
              >
                Thank you for your purchase! Track your order status below.
              </Typography>

              <Box sx={{ width: '100%', my: 4 }}>
                {loadingOrderStatus ? (
                  <CircularProgress sx={{ my: 2, color: '#6366f1' }} />
                ) : (
                  currentOrderId && (
                    <Stepper
                      alternativeLabel
                      activeStep={activeStep}
                      connector={<QontoConnector />}
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontWeight: 500,
                          color: '#334155',
                          fontSize: { xs: 13, sm: 15 },
                        },
                        '& .MuiStepIcon-root': {
                          color: '#e0e7ff',
                        },
                      }}
                    >
                      {ORDER_STATUSES.map((label) => (
                        <Step key={label}>
                          <StepLabel StepIconComponent={QontoStepIcon}>{label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                  )
                )}
              </Box>

              {currentOrderStatus === "Delivered" && (
                <Box
                  sx={{
                    background: 'linear-gradient(90deg,#a7f3d0,#fef9c3)',
                    borderRadius: '8px',
                    p: 2,
                    my: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                  }}
                >
                  <Check sx={{ color: '#16a34a', fontSize: 24 }} />
                  <Typography variant="subtitle1" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    Your order has been delivered. Thank you for shopping with us!
                  </Typography>
                </Box>
              )}

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  justifyContent: 'center',
                  mt: 4,
                }}
              >
                {showDownloadButton && invoicePDF && currentOrderId && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={downloadInvoice}
                    sx={{
                      py: 1.5,
                      fontWeight: 600,
                      fontSize: 16,
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px 0 rgba(99,102,241,0.08)',
                      background: 'linear-gradient(90deg,#6366f1,#a21caf)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
                      },
                      width: { xs: '100%', sm: 'auto' },
                    }}
                    startIcon={
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    }
                  >
                    Download Invoice
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => window.location.href = '/products'}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: 16,
                    borderRadius: '8px',
                    borderColor: '#6366f1',
                    color: '#6366f1',
                    '&:hover': {
                      background: '#6366f1',
                      color: 'white',
                      borderColor: '#6366f1',
                    },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Continue Shopping
                </Button>
              </Box>
            </Box>
          </div>
        </section>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: 9999 }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // Original Checkout Form UI
  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Prevent form submission if payment is successful (though UI changes) */}
          <form onSubmit={paymentSuccessful ? (e) => e.preventDefault() : handlePayment}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              <div className="lg:max-w-[670px] w-full">
                <Login /> {/* Assuming Login component handles its own state */}
                <Billing formData={billingData} handleChange={handleBillingChange} />
              </div>
              <div className="max-w-[455px] w-full">
                <div ref={invoiceRef} className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Order Summary</h3>
                  </div>
                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    {/* Cart items display - as in your existing code */}
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between py-5 border-b border-gray-3">
                        <p className="text-dark">
                          {item.name} × {item.quantity}
                        </p>
                        <p className="text-dark text-right">
                          ₹{((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Shipping Fee</p>
                      <p className="text-dark text-right">₹{shippingFee.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">
                        ₹{grandTotal.toFixed(2)}
                      </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="mt-6">
                      <h4 className="font-medium text-dark mb-3">Payment Method</h4>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="razorpay"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="w-4 h-4"
                          />
                          <span>Pay Now (Credit/Debit Card, UPI, Net Banking)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="w-4 h-4"
                          />
                          <span>Cash On Delivery</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Payment Button - type="submit" to trigger form's onSubmit */}
                 <button
                    type="submit" // Changed to submit
                    // onClick={handlePayment} // onClick is handled by form's onSubmit
                    disabled={cartItems.length === 0} // Disable if cart is empty
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      fontWeight: 500,
                      color: 'white',
                      backgroundColor: paymentMethod === "razorpay" ? '#2563eb' : '#16a34a',
                      padding: '12px 24px',
                      borderRadius: '6px',
                      transition: 'background-color 200ms ease-out',
                      marginTop: '30px',
                      border: 'none',
                      cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                      opacity: cartItems.length === 0 ? 0.6 : 1,
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = paymentMethod === "razorpay" ? '#1d4ed8' : '#15803d'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = paymentMethod === "razorpay" ? '#2563eb' : '#16a34a'}
                  >
                    {paymentMethod === "razorpay" ? 'Pay Now' : 'Place Order (Cash On Delivery)'}
                  </button>

                {/* Download button is now part of the success UI */}
              </div>
            </div>
          </form>
        </div>
      </section>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} sx={{ zIndex: 9999 }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Checkout;