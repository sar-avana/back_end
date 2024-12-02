import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetails.css';
import { backendURL } from './config';

function ProductDetails() {
  const { id } = useParams();  // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      const token = localStorage.getItem("authToken");  // Get the auth token from localStorage

      try {
        const response = await fetch(`${backendURL}/products/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProduct(data);  // Set the fetched product details
        } else {
          setError('Product not found or Unauthorized');
        }
      } catch (error) {
        setError('An error occurred while fetching the product details');
        console.error(error);
      }
    };

    fetchProductDetails();
  }, [id]);  // Fetch product details when the product ID changes

  if (error) {
    return <div>{error}</div>;
  }

  const handleBackClick = () => {
    navigate('/');
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="product-details-container">
      <div className="product-details-content">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
        />
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-description">{product.description}</p>
          <p className="product-price">₹{product.price}</p>
          <p className="product-stock">Stock: {product.stockQuantity}</p>
          <button className="add-to-cart-button">Add to Cart</button>
        </div>
      </div>
      <button className="back-button" onClick={handleBackClick}>
        Back to Products
      </button>
    </div>
  );
};

export default ProductDetails;
