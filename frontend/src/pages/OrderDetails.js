import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';  // useParams to get the orderId from URL
import './OrderDetails.css';
import { backendURL } from './config';

function OrderDetails() {
  const { orderId } = useParams();  // Get the orderId from URL params
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`${backendURL}/order/${orderId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchOrderDetails();
  }, [orderId]);
  const handleProceedToPayment = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendURL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }), // Pass the order ID
      });
  
      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }
  
      const paymentData = await response.json();
  
      // Navigate to the payment page with the order ID and possibly additional data
      navigate(`/payment/${orderId}`, { state: { paymentData } });
    } catch (error) {
      console.error('Error initiating payment:', error.message);
    }
  };
  

  if (!order) {
    return <p>Loading order details...</p>;
  }

return (
    <div className="order-details-container">
      <h1 className="order-title">Order Details</h1>
      <div className="order-summary">
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Total Price:</strong> ₹{order.totalPrice}</p>
        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
        <p><strong>Delivery Status:</strong> {order.deliveryStatus}</p>
      </div>

      <div className="order-items">
        <h2>Items in your Order</h2>
        {order.items.map((item) => (
          <div key={item.product._id} className="order-item">
            <div className="item-name">{item.product.name}</div>
            <div className="item-price">Price: ₹{item.product.price}</div>
            <div className="item-quantity">Quantity: {item.quantity}</div>
            <div className="item-total">
              Total: ₹{item.quantity * item.product.price}
            </div>
          </div>
        ))}
      </div>

      {/* Proceed to Payment Button */}
      {order.paymentStatus === 'Pending' && (
        <button
          className="payment-button"
          onClick={handleProceedToPayment}
        >
          Proceed to Payment
        </button>
      )}

      {/* Post-Payment Success Message */}
      {order.paymentStatus === 'Paid' && (
        <div className="success-message">
          <h2>Order Placed Successfully!</h2>
          <p>Thank you for your purchase. Your order is being processed.</p>
          <button
            className="home-button"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
