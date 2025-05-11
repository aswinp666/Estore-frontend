"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import jsPDF from "jspdf";
import { useAppSelector } from "@/redux/store";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import Billing from "./Billing";

const Checkout = () => {
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const shippingFee = totalPrice * 0.002;
  const grandTotal = totalPrice + shippingFee;

  const invoiceRef = useRef<HTMLDivElement>(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");

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

  const generateInvoicePDF = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const invoiceId = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    setInvoiceNumber(invoiceId);
  
    // Header Section
    pdf.setFontSize(20).setTextColor(40, 53, 147).setFont("helvetica", "bold");
    pdf.text("Estore Online Shop", 105, 20, { align: "center" });
    pdf.setFontSize(14).setTextColor(0, 0, 0);
    pdf.text("TAX INVOICE", 105, 30, { align: "center" });
  
    // Invoice Info
    pdf.setFontSize(10).setFont("helvetica", "normal");
    pdf.text(`Invoice No: ${invoiceId}`, 15, 40);
    pdf.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 15, 45);
    pdf.text(`GSTIN: 22ABCDE1234F1Z5`, 15, 50);
  
    // Billing Info
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
    pdf.setFont("helvetica", "bold").setTextColor(255, 255, 255).setFillColor(0, 128, 0);
    pdf.roundedRect(150, 60, 40, 10, 2, 2, "F");
    pdf.text("PAID", 170, 67, { align: "center" });
  
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
      // Alternate row background
      if (itemCounter % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(15, yPosition - 5, 180, 10, "F");
      }
  
      const amount = (item.discountedPrice ?? item.price) * item.quantity;
      pdf.setFontSize(10).setFont("helvetica", "normal").setTextColor(0, 0, 0);
      pdf.text(itemCounter.toString(), 17, yPosition);
      pdf.text(item.name.substring(0, 30), 30, yPosition);
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
    pdf.text("Payment Method: Razorpay (Online)", 15, yPosition);
  
    pdf.setFontSize(10).setTextColor(40, 53, 147);
    pdf.text("Thank you for your business!", 105, 280, { align: "center" });
    pdf.setTextColor(100, 100, 100);
    pdf.text("Estore Online | support@estore.com | +91 9876543210", 105, 285, { align: "center" });
  
    return { pdf, invoiceId };
  };

    
  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountInPaise = Math.round(grandTotal * 100);

    try {
      const res = await fetch("https://estore-backend-dyl3.onrender.com/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!res.ok) throw new Error("Order creation failed");

      const data = await res.json();

      const options = {
        key: "rzp_test_0rqSTvIDKUiY3m",
        amount: data.amount,
        currency: "INR",
        name: "Estore Online",
        description: "Order Payment",
        order_id: data.id,
        handler: async function (response: any) {
          alert("Payment successful!");
        
          const { pdf, invoiceId } = await generateInvoicePDF();
          
          // ✅ Save invoice to MongoDB
          try {
            const saveRes = await fetch("https://estore-backend-dyl3.onrender.com/api/invoice/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                billingData,
                cartItems,
                shippingFee,
                grandTotal,
                paymentStatus: "Paid",
              }),
            });

            if (!saveRes.ok) throw new Error("Failed to save invoice");
            console.log("Invoice saved successfully!");
          } catch (err) {
            console.error("Invoice save error:", err);
          }

          // Send email with PDF
          const pdfBlob = pdf.output("blob");
          const reader = new FileReader();
        
          reader.onloadend = async function () {
            try {
              const base64PDF = (reader.result as string).split(",")[1];
        
              await fetch("https://estore-backend-dyl3.onrender.com/api/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to: billingData.email,
                  subject: "Thank You for Your Purchase!",
                  html: `<p>Hi <strong>${billingData.firstName}</strong>,</p>
                         <p>Thanks for shopping with us!</p>
                         <p><strong>Amount Paid:</strong> ₹${grandTotal.toFixed(2)}</p>`,
                  attachment: {
                    filename: `Invoice_${invoiceId}.pdf`,
                    content: base64PDF,
                  },
                }),
              });

              pdf.save(`Invoice_${invoiceId}.pdf`);
            } catch (error) {
              console.error("Email error:", error);
            }
          };
        
          reader.readAsDataURL(pdfBlob);
        },
        prefill: {
          name: billingData.firstName + " " + billingData.lastName,
          email: billingData.email,
          contact: billingData.phone,
        },
        theme: { color: "#0d6efd" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Please try again.");
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              <div className="lg:max-w-[670px] w-full">
                <Login />
                <Billing formData={billingData} handleChange={handleBillingChange} />
              </div>
              <div className="max-w-[455px] w-full">
                <div ref={invoiceRef} className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Order Summary</h3>
                  </div>
                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>
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
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePayment}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
                >
                  Pay Now
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Checkout;
