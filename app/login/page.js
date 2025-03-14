"use client";

import React, { useState, Suspense } from "react";
import { supabase } from "../supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formMode, setFormMode] = useState('login'); // 'login', 'forgotPassword', 'resetPassword'
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, message: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Existing login functionality
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      toast("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast("Invalid credentials. Please try again.");
        throw error;
      }

      if (data.session) {
        router.push("/Ads");
      } else {
        toast("Your email is not verified. Please verify your email first.");
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Google login functionality
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        // console.error("Google login error:", error);
        // throw error;
      }
    } catch (error) {
      // console.error(error.message);
    }
  };

  // New forgot password functionality
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email } = formData;

    if (!email) {
      toast("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?mode=resetPassword`,
      });

      if (error) throw error;

      toast("Password reset link has been sent to your email.");
      setFormMode('login');
    } catch (error) {
      toast(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // New reset password functionality
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      toast("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast("Password has been successfully reset. Please login with your new password.");
      setFormMode('login');
    } catch (error) {
      toast(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // const showPopup = (message) => {
  //   setPopup({ open: true, message });
  //   setTimeout(() => {
  //     setPopup({ open: false, message: "" });
  //   }, 3000);
  // };

  // Check for reset password mode on component mount
  React.useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'resetPassword') {
      setFormMode('resetPassword');
    }
  }, [searchParams]);

  // Render different forms based on formMode
  const renderForm = () => {
    switch (formMode) {
      case 'forgotPassword':
        return (
          <form onSubmit={handleForgotPassword} className="max-w-lg w-full mx-auto">
            <div className="mb-12">
              <h3 className="text-gray-800 text-4xl font-bold">Forgot Password</h3>
              <p className="text-gray-600 mt-4">Enter your email address to receive a password reset link.</p>
            </div>
            
            <div>
              <label className="text-gray-800 text-xs block mb-2">Email</label>
              <div className="relative flex items-center">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Enter email"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-2"
                  viewBox="0 0 682.667 682.667"
                >
                  <defs>
                    <clipPath id="a" clipPathUnits="userSpaceOnUse">
                      <path d="M0 512h512V0H0Z" data-original="#000000"></path>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#a)" transform="matrix(1.33 0 0 -1.33 0 682.667)">
                    <path
                      fill="none"
                      strokeMiterlimit="10"
                      strokeWidth="40"
                      d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
                      data-original="#000000"
                    ></path>
                  </g>
                </svg>
              </div>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 text-sm font-semibold tracking-wider rounded-full text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-[#222]"
                }`}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setFormMode('login')}
              className="mt-4 text-blue-600 hover:underline text-sm"
            >
              Back to Login
            </button>
          </form>
        );

      case 'resetPassword':
        return (
          <form onSubmit={handleResetPassword} className="max-w-lg w-full mx-auto">
            <div className="mb-12">
              <h3 className="text-gray-800 text-4xl font-bold">Reset Password</h3>
              <p className="text-gray-600 mt-4">Enter your new password below.</p>
            </div>

            <div className="mt-8">
              <label className="text-gray-800 text-xs block mb-2">New Password</label>
              <div className="relative flex items-center">
                <input
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Enter new password"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  viewBox="0 0 128 128"
                >
                  <path
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="mt-8">
              <label className="text-gray-800 text-xs block mb-2">Confirm New Password</label>
              <div className="relative flex items-center">
                <input
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Confirm new password"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  viewBox="0 0 128 128"
                >
                  <path
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 text-sm font-semibold tracking-wider rounded-full text-white ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-gray-800 hover:bg-[#222]"
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        );

      default:
        return (
          <form className="max-w-lg w-full mx-auto" onSubmit={handleLogin}>
            <div className="mb-12">
              <h3 className="text-gray-800 text-4xl font-bold">Sign in</h3>
              <p className="text-gray-800 text-sm mt-4">
                Don't have an account?
                <Link
                  href="/register"
                  className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap"
                >
                  Register here
                </Link>
              </p>
            </div>
            <div>
              <label className="text-gray-800 text-xs block mb-2">Email</label>
              <div className="relative flex items-center">
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  required
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Enter email"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-2"
                  viewBox="0 0 682.667 682.667"
                >
                  <defs>
                    <clipPath id="a" clipPathUnits="userSpaceOnUse">
                      <path d="M0 512h512V0H0Z" data-original="#000000"></path>
                    </clipPath>
                  </defs>
                  <g clipPath="url(#a)" transform="matrix(1.33 0 0 -1.33 0 682.667)">
                    <path
                      fill="none"
                      strokeMiterlimit="10"
                      strokeWidth="40"
                      d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
                      data-original="#000000"
                    ></path>
                  </g>
                </svg>
                </div>
            </div>

            <div className="mt-8">
              <label className="text-gray-800 text-xs block mb-2">Password</label>
              <div className="relative flex items-center">
                <input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Enter password"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#bbb"
                  stroke="#bbb"
                  className="w-[18px] h-[18px] absolute right-2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  viewBox="0 0 128 128"
                >
                  <path
                    d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z"
                    data-original="#000000"
                  ></path>
                </svg>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="text-gray-800 ml-3 block text-sm"
                >
                  Remember me
                </label>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => setFormMode('forgotPassword')}
                  className="text-blue-600 font-semibold text-sm hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div className="mt-12">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 text-sm font-semibold tracking-wider rounded-full text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-800 hover:bg-[#222]"
                } focus:outline-none`}
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </div>

            <div className="my-4 flex items-center gap-4">
              <hr className="w-full border-gray-300" />
              <p className="text-sm text-gray-800 text-center">or</p>
              <hr className="w-full border-gray-300" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-3 px-6 text-sm font-semibold tracking-wider text-gray-800 border border-gray-300 rounded-full bg-gray-50 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20px"
                className="inline"
                viewBox="0 0 512 512"
              >
                <path
                  fill="#fbbd00"
                  d="M120 256c0-25.367 6.989-49.13 19.131-69.477v-86.308H52.823C18.568 144.703 0 198.922 0 256s18.568 111.297 52.823 155.785h86.308v-86.308C126.989 305.13 120 281.367 120 256z"
                  data-original="#fbbd00"
                />
                <path
                  fill="#0f9d58"
                  d="m256 392-60 60 60 60c57.079 0 111.297-18.568 155.785-52.823v-86.216h-86.216C305.044 385.147 281.181 392 256 392z"
                  data-original="#0f9d58"
                />
                <path
                  fill="#31aa52"
                  d="m139.131 325.477-86.308 86.308a260.085 260.085 0 0 0 22.158 25.235C123.333 485.371 187.62 512 256 512V392c-49.624 0-93.117-26.72-116.869-66.523z"
                  data-original="#31aa52"
                />
                <path
                  fill="#3c79e6"
                  d="M512 256a258.24 258.24 0 0 0-4.192-46.377l-2.251-12.299H256v120h121.452a135.385 135.385 0 0 1-51.884 55.638l86.216 86.216a260.085 260.085 0 0 0 25.235-22.158C485.371 388.667 512 324.38 512 256z"
                  data-original="#3c79e6"
                />
                <path
                  fill="#cf2d48"
                  d="m352.167 159.833 10.606 10.606 84.853-84.852-10.606-10.606C388.668 26.629 324.381 0 256 0l-60 60 60 60c36.326 0 70.479 14.146 96.167 39.833z"
                  data-original="#cf2d48"
                />
                <path
                  fill="#eb4132"
                  d="M256 120V0C187.62 0 123.333 26.629 74.98 74.98a259.849 259.849 0 0 0-22.158 25.235l86.308 86.308C162.883 146.72 206.376 120 256 120z"
                  data-original="#eb4132"
                />
              </svg>
              Continue with Google
            </button>
          </form>
        );
    }
  };

  return (
    <>
      {/* Popup Component */}
      {popup.open && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-md w-96 text-center">
            <p className="text-gray-800 text-lg font-medium">{popup.message}</p>
            <button
              onClick={() => setPopup({ open: false, message: "" })}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="font-[sans-serif] bg-gray-900 md:h-screen">
        <div className="grid md:grid-cols-2 items-center gap-8 h-full">
          <div className="max-md:order-1 p-4 hidden md:block">
            <img
              src="https://readymadeui.com/signin-image.webp"
              className="lg:max-w-[80%] w-full h-full object-contain block mx-auto"
              alt="login-image"
            />
          </div>

          <div className="flex items-center md:p-8 p-6 bg-white md:rounded-tl-[55px] md:rounded-bl-[55px] h-full">
            {renderForm()}
          </div>
        </div>
      </div>
       {/* Add this line */}
       <ToastContainer />
    </>
  );
};

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}