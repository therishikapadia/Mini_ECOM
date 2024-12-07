import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Import Toaster

const LoginPage = ({ apiBaseUrl }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle form submission
  const onSubmit = async (data) => {
    const userInfo = {
      email: data.email,
      password: data.password,
    };

    try {
      // Send login request to the backend
      const res = await axios.post(`${apiBaseUrl}/user/login`, userInfo, {
        withCredentials: true, // Ensure cookies are sent and received
      });

      console.log(res);

      // Check if login was successful
      if (res.data.success) {
        toast.success("Login successful!"); // Toast notification

        // Store user info in localStorage and handle role-based navigation
        setTimeout(() => {
          localStorage.setItem("Users", JSON.stringify(res.data.data.user.name));
          localStorage.setItem("authToken", JSON.stringify(res.data.token));
          const role = res.data.data.user.role;

          switch (role) {
            case "ADMIN":
              navigate("/admin");
              window.location.reload();
              break;
            case "CUSTOMER":
              navigate("/customer");
              window.location.reload();
              break;
            case "DELIVERY_AGENT":
              navigate("/delivery-dashboard");
              window.location.reload();
              break;
            default:
              toast.error("Unknown user role!");
          }
        }, 1000);
      } else {
        toast.error("Unknown user!");
      }
    } catch (err) {
      // Handle error responses
      if (err.response) {
        toast.error(err.response.data.message || "Login failed.");
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }
  };


  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      {/* Center Toaster */}
      <Toaster
        position="top-center" // Position to top-center
        reverseOrder={false}
        toastOptions={{
          duration: 3000, // Customize duration (optional)
        }}
      />
      <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            {/* Email Input */}
            <label>Email:</label>
            <input
              type="email"
              className="form-control shadow-none"
              placeholder="Enter your email"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <span className="text-danger">{errors.email.message}</span>
            )}
          </div>

          <div className="mb-3 position-relative">
            {/* Password Input */}
            <label>Password:</label>
            <input
              type={showPassword ? "text" : "password"} // Toggle input type
              className="form-control shadow-none"
              placeholder="Enter your password"
              {...register("password", { required: "Password is required" })}
            />
            <button
              type="button"
              style={{ marginTop: "12px" }}
              className="btn btn-md position-absolute top-50 end-0 translate-middle-y me-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"} {/* Toggle icon */}
            </button>
            {errors.password && (
              <span className="text-danger">{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className="btn btn-success w-100 mb-3">
            Login
          </button>

          <div className="d-flex justify-content-between mb-3">
            <Link to="/admin-login" className="text-primary">
              Admin Login
            </Link>
            <Link to="/user-login" className="text-primary">
              User Login
            </Link>
            <Link to="/delivery-login" className="text-primary">
              Delivery Login
            </Link>
          </div>

          <div className="d-flex justify-content-between mb-3">
            <Link to="/forgot-password" className="text-primary">
              Forgot Password?
            </Link>
          </div>

          <p className="text-center m-0">
            Not registered?{" "}
            <Link to="/signup" className="text-primary">
              Signup
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
