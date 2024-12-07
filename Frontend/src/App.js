import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./components/Admin/AdminPanel";
import LoginPage from "./components/Admin/LoginPage";
import SignupPage from "./components/Admin/SignupPage";
import User from "./components/User/User";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // For administration
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false); // For user
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const role = localStorage.getItem("role"); // Get role from localStorage
      if (role === "ADMIN") {
        setIsAuthenticated(true);
      } else if (role === "CUSTOMER") {
        setIsAuthenticatedUser(true);
      }
    }
    setLoading(false); // Set loading to false after checking authentication
  }, []);

  // Render a loading spinner or placeholder while checking authentication
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Routes>
        {/* Admin Protected Route */}
        <Route
          path="/admin/*"
          element={
            isAuthenticated ? (
              <AdminPanel apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Customer/User Protected Route */}
        <Route
          path="/customer/*"
          element={
            isAuthenticatedUser ? (
              <User apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Login Route */}
        <Route
          path="/"
          element={
            !isAuthenticated && !isAuthenticatedUser ? (
              <LoginPage apiBaseUrl="http://localhost:8000" />
            ) : isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/customer" replace />
            )
          }
        />

        {/* Signup Route */}
        <Route
          path="/signup"
          element={
            !isAuthenticated && !isAuthenticatedUser ? (
              <SignupPage apiBaseUrl="http://localhost:8000" />
            ) : isAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/customer" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
