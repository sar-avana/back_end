import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { backendURL } from './config';

function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0); // State for cart count
  const navigate = useNavigate();

  // Check login status on component load
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token); // Set to true if token exists
    fetchCartCount(); // Fetch cart count on page load
  }, []);

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`${backendURL}/cart`, {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,  // Include the token in the Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        const totalCount = data.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(totalCount);
      } else {
        console.error("Failed to fetch cart count.");
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Clear auth token
    setIsLoggedIn(false); // Update login state
    navigate("/"); // Redirect to home page
  };

  // Fetch products based on search query
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Get the token from localStorage
      const response = await fetch(`${backendURL}/products?query=${searchQuery}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send the token in the Authorization header
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        console.error("Failed to fetch products: Unauthorized");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Add product to cart
  const handleAddToCart = async (productId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Please log in to add items to the cart.");
        return;
      }

      const response = await fetch(`${backendURL}/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        fetchCartCount(); // Update the cart count
      } else {
        console.error("Failed to add product to cart.");
      }
    } catch (error) {
      console.error("Error adding product to cart:", error);
    }
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">FoodCarT</div>

        <div className="nav-center">
          {/* Search bar visible only when logged in */}
          {isLoggedIn && (
            <>
              <input
                type="text"
                className="search-bar"
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-button" onClick={fetchProducts}>
                Search
              </button>
            </>
          )}
        </div>

        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <button className="nav-button" onClick={handleLogout}>
                Logout
              </button>
              <div className="cart-icon" onClick={() => navigate("/cart")}>
              <img src="/images/cart.jpg" alt="Cart" className="cart-image" />
                <span>{cartCount}</span>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="nav-button">
                Login
              </a>
              <a href="/register" className="nav-button">
                Signup
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <h1>Welcome to FoodCarT</h1>
          <p>Your one-stop shop for quick groceries!</p>
        </div>
      </div>

      {/* Search Results */}
      {products.length > 0 && (
        <div className="product-list">
          {products.map((product) => (
            <div key={product._id} className="product-item">
              {/* Product Image */}
              <div className="product-image-container">
                <img
                  src={product.imageUrl || "https://via.placeholder.com/150"} // Default placeholder if no image is provided
                  alt={product.name}
                  className="product-image"
                />
              </div>

              {/* Product Details */}
              <div className="product-details">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">₹{product.price}</p>
              </div>

              {/* Action Buttons */}
              <button className="view-details-button" onClick={() => navigate(`/product/${product._id}`)}>
                View Details
              </button>
              <button className="add-to-cart-button" onClick={() => handleAddToCart(product._id)}>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <footer>© 2024 Clone</footer>
    </div>
  );
}

export default Home;
