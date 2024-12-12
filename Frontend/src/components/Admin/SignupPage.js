import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = ({ mode, apiBaseUrl }) => {
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

  const sendVerificationEmail = async (userInfo) => {
    try {
      const res = await axios.post(`${apiBaseUrl}/user/send-verification`, {
        name: userInfo.name,
        email: userInfo.email
      });

      if (res.data) {
        // Store user info in local storage temporarily
        localStorage.setItem('pendingUserSignup', JSON.stringify({
          ...userInfo,
          verificationToken: res.data.verificationToken
        }));

        toast.success("Verification email sent! Please check your inbox.");
        setIsVerificationSent(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send verification email");
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
      confirmPassword: data.confirmPassword
    };

    // First, send verification email
    await sendVerificationEmail(userInfo);
  };

  const completeSignup = async (verificationCode) => {
    try {
      // Retrieve pending user info
      const pendingUserSignup = JSON.parse(localStorage.getItem('pendingUserSignup'));
      
      if (!pendingUserSignup) {
        toast.error("No pending signup found. Please start signup process again.");
        return;
      }

      // Send verification request
      const res = await axios.post(`${apiBaseUrl}/user/verify-email`, {
        email: pendingUserSignup.email,
        verificationCode: verificationCode
      });

      if (res.data) {
        // Complete user registration
        const signupRes = await axios.post(`${apiBaseUrl}/user/signup`, pendingUserSignup);
        
        if (signupRes.data) {
          toast.success("Signup successful!");
          localStorage.removeItem('pendingUserSignup');
          localStorage.setItem("Users", JSON.stringify(signupRes.data.data.user.name));
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
      setIsVerificationSent(false);
    }
  };

  // Verification form
  const VerificationForm = () => {
    const [verificationCode, setVerificationCode] = useState('');

    const handleVerification = () => {
      if (verificationCode.trim()) {
        completeSignup(verificationCode);
      } else {
        toast.error("Please enter verification code");
      }
    };

    return (
      <div className="card shadow-lg p-4" style={{ maxWidth: '400px', borderRadius: '20px' }}>
        <h3 className="text-center mb-4">Verify Your Email</h3>
        <div className="mb-3">
          <label>Verification Code:</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </div>
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