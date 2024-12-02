import React from 'react';
import { useNavigate } from 'react-router-dom';  // For navigation after logout
import './Product.css';

function Product() {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    // Remove the token from localStorage (or use a state management solution)
    localStorage.removeItem('authToken');
    navigate('/'); // Redirect to Home page
  };

  return (
    <div className="product-container">
      <h2>Product Page</h2>
      
      <button onClick={handleLogout} className="logout-btn">
        Logout
      </button>

      {/* Render your products here */}
    </div>
  );
}

export default Product;
