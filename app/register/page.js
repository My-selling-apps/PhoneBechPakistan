"use client";
import React, { useState } from "react";
import { supabase } from "../supabase"; // Import Supabase client
import { useRouter } from "next/navigation";
import Link from "next/link";

const Page = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, message: "" }); // Modal state
  const [otp, setOtp] = useState(""); // To store the OTP entered by the user
  const [showOtpField, setShowOtpField] = useState(false); // To toggle between form and OTP field

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password, confirmPassword, phoneNumber } = formData;

    if (!email || !password || !confirmPassword || !phoneNumber) {
      showModal("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      showModal("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      // First, clean up any existing data for this email
      await supabase.from("temp_users").delete().eq("email", email);
      await supabase.from("otp_table").delete().eq("email", email);

      // Then proceed with new registration
      const response = await fetch("/api/mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          userFirstname: email,
          password,
          phoneNumber,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowOtpField(true);
        showModal("OTP sent to your email. Please check your inbox.");
      } else {
        showModal(result.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      showModal("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    try {
      // Step 1: Get temp user data first
      const { data: tempUserData, error: tempUserError } = await supabase
        .from("temp_users")
        .select("*")
        .eq("email", formData.email)
        .single();

      if (tempUserError || !tempUserData) {
        showModal("Registration session expired. Please register again.");
        setShowOtpField(false); // Go back to registration form
        return;
      }

      // Step 2: Verify OTP
      const { data: otpData, error: otpError } = await supabase
        .from("otp_table")
        .select("otp")
        .eq("email", formData.email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (otpError || !otpData) {
        showModal("OTP verification failed. Please try again.");
        return;
      }

      if (otpData.otp !== otp) {
        showModal("Incorrect OTP. Please try again.");
        return;
      }

      // Step 3: Create new user in authentication
      const { error: signUpError } = await supabase.auth.signUp({
        email: tempUserData.email,
        password: tempUserData.password,
      });

      if (signUpError) {
        showModal("Failed to register user. Please try again.");
        return;
      }

      // Step 4: Clean up temp data
      await Promise.all([
        supabase.from("otp_table").delete().eq("email", formData.email),
        supabase.from("temp_users").delete().eq("email", formData.email),
      ]);

      // Step 5: Success and redirect
      showModal("Registration successful! Redirecting...");
      setTimeout(() => router.push("/Ads"), 2000);
    } catch (error) {
      showModal("An error occurred. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
        });

      if (signInError) {
        // console.error("Sign-In Error:", signInError);
        showModal("Google sign-in failed");
        return;
      }

      let user = null;
      for (let attempts = 0; attempts < 10; attempts++) {
        const { data: fetchedUser, error: userError } =
          await supabase.auth.getUser();

        if (!userError && fetchedUser?.user) {
          user = fetchedUser.user;
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      if (!user) {
        showModal("Failed to authenticate user after Google Sign-In.");
        // console.error("User fetch after sign-in timed out.");
        return;
      }

      const { error: insertError } = await supabase
        .from("user_other_credentials")
        .upsert({
          id: user.id,
          email: user.email,
          phone_number: null,
          role: "user",
        });

      if (insertError) {
        // console.error("Data Insertion Error:", insertError);
        showModal("Failed to save user data.");
        return;
      }

      showModal("Sign-in successful.");
      router.push("/Ads");
    } catch (error) {
      // console.error("An unexpected error occurred during sign-in:", error);
      showModal("An unexpected error occurred. Please try again.");
    }
  };

  const showModal = (message) => {
    setModal({ open: true, message });
    setTimeout(() => {
      setModal({ open: false, message: "" });
    }, 3000);
  };

  return (
    <>
      {/* Modal */}
      {modal.open && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded-lg shadow-md w-96 text-center">
            <p className="text-gray-800 text-lg font-medium">{modal.message}</p>
            <button
              onClick={() => setModal({ open: false, message: "" })}
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
            <form
              onSubmit={handleSignUp}
              className="max-w-lg w-full mx-auto"
            >
              <div className="mb-12">
                <h3 className="text-gray-800 text-4xl font-bold">Sign up</h3>
                <p className="text-gray-800 text-sm mt-4">
                  Already have an account?
                  <Link
                    href="/login"
                    className="text-blue-600 font-semibold hover:underline ml-1 whitespace-nowrap"
                  >
                    Login here
                  </Link>
                </p>
              </div>

              {!showOtpField ? (
                <>
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
                    <label className="text-gray-800 text-xs block mb-2">Phone Number</label>
                    <div className="relative flex items-center">
                      <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        type="text"
                        required
                        className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="text-gray-800 text-xs block mb-2">Password</label>
                    <div className="relative flex items-center">
                      <input
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        type="password"
                        required
                        className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                        placeholder="Enter password"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <label className="text-gray-800 text-xs block mb-2">Confirm Password</label>
                    <div className="relative flex items-center">
                      <input
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        type="password"
                        required
                        className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                        placeholder="Confirm password"
                      />
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
                      {loading ? "Signing up..." : "Sign up"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-8">
                    <label className="text-gray-800 text-xs block mb-2">OTP</label>
                    <div className="relative flex items-center">
                      <input
                        name="otp"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        type="text"
                        required
                        className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                        placeholder="Enter OTP"
                      />
                    </div>
                  </div>

                  <div className="mt-12">
                    <button
                      type="button"
                      onClick={handleOtpVerification}
                      className="w-full py-3 px-6 text-sm font-semibold tracking-wider rounded-full text-white bg-gray-800 hover:bg-[#222]"
                    >
                      Verify OTP
                    </button>
                  </div>
                </>
              )}

              <div className="my-4 flex items-center gap-4">
                <hr className="w-full border-gray-300" />
                <p className="text-sm text-gray-800 text-center">or</p>
                <hr className="w-full border-gray-300" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
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
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;