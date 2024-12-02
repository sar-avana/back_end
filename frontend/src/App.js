import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Product from './pages/Product';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import OrderDetails from './pages/OrderDetails';  // Order details page
import PaymentPage from './pages/PaymentPage';  // Adjust the import based on your structure

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product" element={<Product />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<OrderDetails />} />  {/* Order details route */}
        <Route path="/payment/:id" element={<PaymentPage />} />  {/* Define this route */}
        
      </Routes>
    </Router>
  );
}

export default App;
