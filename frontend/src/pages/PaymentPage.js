import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { backendURL } from './config';

function PaymentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams(); // Get the order ID from URL params
  const location = useLocation();
  const paymentData = location.state?.paymentData; // Get payment data passed via navigate

  const handlePayment = async () => {
    if (!paymentData) {
      alert('Payment data missing! Redirecting back to Order Details.');
      navigate(`/order/${orderId}`);
      return;
    }

    const { orderId: razorpayOrderId, amount, currency } = paymentData;

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay Key ID
      amount: amount,
      currency: currency,
      name: 'Your Company',
      description: 'Order Payment',
      order_id: razorpayOrderId,
      handler: async function (response) {
        try {
          const token = localStorage.getItem('authToken');
          const paymentData = {
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };

          // Confirm the payment
          const confirmResponse = await fetch(`${backendURL}/payment/confirm-order`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
          });

          if (!confirmResponse.ok) {
            throw new Error('Payment confirmation failed');
          }

          const data = await confirmResponse.json();
          alert('Payment successful! Redirecting to Order Details...');
          navigate(`/order/${data.order._id}`); // Redirect to OrderDetails
        } catch (error) {
          console.error('Error confirming payment:', error);
          alert('Payment confirmation failed. Please try again.');
        }
      },
      prefill: {
        name: 'Your Name',
        email: 'your.email@example.com',
        contact: '9999999999',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  useEffect(() => {
    handlePayment();
  }, []);

  return (
    <div>
      <h1>Processing Payment...</h1>
    </div>
  );
}

export default PaymentPage;
