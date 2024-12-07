import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import AdminPanel from "./components/Admin/AdminPanel";
import LoginPage from "./components/Admin/LoginPage";
import SignupPage from "./components/Admin/SignupPage";
import User from "./components/User/User";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); //This is for administration
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false); // This is for User
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
      navigate("/admin", { replace: true }); // Prevent redundant history entries
    } else {
      setIsAuthenticated(false);
      navigate("/", { replace: true }); // Prevent redundant history entries
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally leaving navigate out of the dependency array

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticatedUser(true);
      navigate("/customer", { replace: true }); // Prevent redundant history entries
    } else {
      setIsAuthenticatedUser(false);
      navigate("/", { replace: true }); // Prevent redundant history entries
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally leaving navigate out of the dependency array


  return (
    <div>
      <Routes>
        {/* Protected Route for Admin Panel */}
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

        <Route
          path="/customer/*"
          element={
            isAuthenticated ? (
              <User apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

      
        {/* Public Route for Login */}
        <Route
          path="/"
          element={
            !isAuthenticatedUser ? (
              <LoginPage apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />

        {/* Public Route for Signup */}
        <Route
          path="/signup"
          element={
            !isAuthenticated ? (
              <SignupPage apiBaseUrl="http://localhost:8000" />
            ) : (
              <Navigate to="/admin" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
