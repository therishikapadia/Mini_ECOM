import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

const Signup = ({ mode, apiBaseUrl }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

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

    try {
      const res = await axios.post(`${apiBaseUrl}/user/signup`, userInfo);
      console.log(res);
      if (res.data) {
        toast.success("Signup successful!");
        localStorage.setItem("Users", JSON.stringify(res.data.data.user.name));
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response) {
        toast.error(err.response.data.error || "Error during signup.");
      } else {
        toast.error("Something went wrong, please try again.");
      }
    }
  };

  return (
    <div className={`bg-${mode} text-${mode === 'light' ? 'dark' : 'light'}`}>
      <div className="container d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
                {...register("confirmPassword", { required: "Please confirm your password" })}
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
      </div>
    </div>
  );
};

export default Signup;
