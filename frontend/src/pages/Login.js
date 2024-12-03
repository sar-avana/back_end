import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // For navigation after login
import './Login.css';
import { backendURL } from './config';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  // Handle email change
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Handle password change
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const response = await fetch(`${backendURL}/login`, { // Replace with your backend API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      const data = await response.json(); // Assuming backend returns JSON response

      if (response.ok) {
        // If login is successful, store the token in localStorage (or use a state management solution)
        localStorage.setItem('authToken', data.token);  // Store token from backend
        console.log('Login successful:', data);
        navigate('/'); // Redirect to product page after successful login
      } else {
        setError(data.message || 'Login failed. Please try again');
      }
    } catch (error) {
      setError('An error occurred while logging in. Please try again later.');
      console.error(error);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account? <a href="/register">Sign up here</a> {/* Updated link to register page */}
      </p>
    </div>
  );
}

export default Login;
