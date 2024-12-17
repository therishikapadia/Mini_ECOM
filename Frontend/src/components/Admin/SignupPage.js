import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = ({ apiBaseUrl }) => {
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm();

  const sendSignupData = async (userInfo) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/user/signup`, userInfo);

      if (res.data.success) {
        // Store user info in local storage temporarily
        localStorage.setItem('pendingUserSignup', JSON.stringify({
          email: userInfo.email,
          token: res.data.data.user.resetPasswordToken
        }));

        toast.success("Signup successful! Check your email for the verification code.");
        setIsVerificationSent(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed. Please try again.");
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const userInfo = {
      name: data.name,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      longitude: 12,
      latitude: 120
    };

    // Send signup data to the backend
    await sendSignupData(userInfo);
  };

  const completeSignup = async (verificationCode) => {
    try {
      // Retrieve pending user info
      const pendingUserSignup = JSON.parse(localStorage.getItem('pendingUserSignup'));

      if (!pendingUserSignup) {
        toast.error("No pending signup found. Please start signup process again.");
        return;
      }

      const { email, token } = pendingUserSignup;

      // Send verification request
      const res = await axios.post(`${apiBaseUrl}/user/confirm-signup/${token}`, {});

      if (res.data) {
        toast.success("Signup confirmed successfully!");
        localStorage.removeItem('pendingUserSignup');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed. Please try again.");
      setIsVerificationSent(false);
    }
  };

  // Verification form
  const VerificationForm = () => {
    const handleVerification = () => {
      completeSignup();
    };

    return (
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', borderRadius: '20px' }}>
        <h3 className="text-center mb-4">Verify Your Email</h3>
        <button 
          onClick={handleVerification} 
          className="btn btn-success w-100"
        >
          Verify Email
        </button>
        <div className="text-center mt-3">
          <button 
            onClick={() => setIsVerificationSent(false)} 
            className="btn btn-link"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  };

  // Initial signup form
  const SignupForm = () => (
    <div className="card shadow-lg p-4" style={{ maxWidth: '400px', borderRadius: '20px' }}>
      <h3 className="text-center mb-4">Sign Up</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label>Full Name:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your full name"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <span className="text-danger">{errors.name.message}</span>}
        </div>
        <div className="mb-3">
          <label>Email:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
          />
          {errors.email && <span className="text-danger">{errors.email.message}</span>}
        </div>
        <div className="mb-3">
          <label>Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && <span className="text-danger">{errors.password.message}</span>}
        </div>
        <div className="mb-3">
          <label>Confirm Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Confirm your password"
            {...register("confirmPassword", { 
              required: "Please confirm your password",
              validate: (value) => 
                value === getValues("password") || "Passwords do not match"
            })}
          />
          {errors.confirmPassword && (
            <span className="text-danger">{errors.confirmPassword.message}</span>
          )}
        </div>
        <button type="submit" className="btn btn-success w-100">Sign Up</button>
      </form>
      <div className="text-center mt-3">
        Already have an account?{" "}
        <Link to="/" className="text-primary">Login</Link>
      </div>
    </div>
  );

  return (
    <div className={`bg-${mode} text-${mode === 'light' ? 'dark' : 'light'}`}>
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        {isVerificationSent ? <VerificationForm /> : <SignupForm />}
      </div>
    </div>
  );
};

export default Signup;
