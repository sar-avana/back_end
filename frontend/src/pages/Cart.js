import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import { backendURL } from './config';

function Cart() {
  const [cart, setCart] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem('authToken');
      try {
        const response = await fetch(`${backendURL}/cart`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }
        const data = await response.json();
        setCart(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchCart();
  }, []);

  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${backendURL}/order/placeOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      const data = await response.json();
      // Clear the cart state in the frontend
      setCart(null);
      
      // After placing the order, redirect to the order details page
      navigate(`/order/${data.order._id}`);  // Navigate to the order details page with the order ID
    } catch (error) {
      console.error(error.message);
    }
  };

  if (!cart) {
    return <p>Loading cart...</p>;
  }

  return (
    <div className="cart-container">
      <h1 className="cart-title">Your Cart</h1>
      <div className="cart-content">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.product._id} className="cart-item">
              <img
                src={item.product.imageUrl || 'https://via.placeholder.com/100'}
                alt={item.product.name}
                className="cart-item-image"
              />
              <div className="item-details">
                <div className="item-name">{item.product.name}</div>
                <div className="item-price">₹{item.product.price}</div>
                <div className="item-quantity">
                  Quantity: {item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="summary-title">Order Summary</div>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{cart.totalPrice}</span>
          </div>
          <div className="summary-total">Total: ₹{cart.totalPrice}</div>
          <button className="checkout-button" onClick={handlePlaceOrder}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;
