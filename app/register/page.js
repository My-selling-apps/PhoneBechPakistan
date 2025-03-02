"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Import Supabase client
import { useRouter } from "next/navigation";

const page = () => {
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

// First update handleSignUp to clear any existing temp data for the email
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
    await supabase
      .from("temp_users")
      .delete()
      .eq("email", email);
    
    await supabase
      .from("otp_table")
      .delete()
      .eq("email", email);

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

// Then update handleOtpVerification
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
      supabase
        .from("otp_table")
        .delete()
        .eq("email", formData.email),
      supabase
        .from("temp_users")
        .delete()
        .eq("email", formData.email)
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
      // Step 1: Initiate Google Sign-In
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
        });

      if (signInError) {
        console.error("Sign-In Error:", signInError);
        showModal("Google sign-in failed");
        return;
      }

      // Step 2: Wait for the user to be authenticated
      let user = null;
      for (let attempts = 0; attempts < 10; attempts++) {
        // Attempt to fetch the authenticated user
        const { data: fetchedUser, error: userError } =
          await supabase.auth.getUser();

        if (!userError && fetchedUser?.user) {
          user = fetchedUser.user;
          break; // Break out of the loop if user is successfully fetched
        }

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 500ms between attempts
      }

      if (!user) {
        showModal("Failed to authenticate user after Google Sign-In.");
        console.error("User fetch after sign-in timed out.");
        return;
      }

      // Step 3: Insert or update user data in `user_other_credentials`
      const { error: insertError } = await supabase
        .from("user_other_credentials")
        .upsert({
          id: user.id, // Use the fetched user's ID
          email: user.email,
          phone_number: null, // Default phone number as null
          role: "user", // Default role
        });

      if (insertError) {
        console.error("Data Insertion Error:", insertError);
        showModal("Failed to save user data.");
        return;
      }

      // Success message and redirect
      showModal("Sign-in successful.");
      router.push("/Ads"); // Redirect to the homepage
    } catch (error) {
      console.error("An unexpected error occurred during sign-in:", error);
      showModal("An unexpected error occurred. Please try again.");
    }
  };

  const showModal = (message) => {
    setModal({ open: true, message });
    setTimeout(() => {
      setModal({ open: false, message: "" });
    }, 3000); // Auto-close modal after 3 seconds
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
      <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
        <form
          onSubmit={handleSignUp}
          className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1"
        >
          <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
            <div className="mt-12 flex flex-col items-center">
              <h1 className="text-2xl xl:text-3xl font-extrabold">Sign up</h1>
              <div className="w-full flex-1 mt-8">
                <div className="flex flex-col items-center">
                  {/* Google Sign-In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline"
                  >
                    <div className="bg-white p-2 rounded-full">
                      <svg className="w-4" viewBox="0 0 533.5 544.3">
                        <path
                          d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z"
                          fill="#4285f4"
                        />
                        <path
                          d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z"
                          fill="#34a853"
                        />
                        <path
                          d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z"
                          fill="#fbbc04"
                        />
                        <path
                          d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z"
                          fill="#ea4335"
                        />
                      </svg>
                    </div>
                    <span className="ml-4">Sign Up with Google</span>
                  </button>

                  {/* Divider */}
                  <div className="my-12 border-b text-center">
                    <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                      Or sign up with e-mail
                    </div>
                  </div>

                  {/* Sign-Up Form */}
                  <div className="mx-auto max-w-xs">
                    {!showOtpField ? (
                      <>
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          type="email"
                          placeholder="Email"
                        />
                        <input
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                          type="text"
                          placeholder="Phone Number"
                        />
                        <input
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                          type="password"
                          placeholder="Password"
                        />
                        <input
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                          type="password"
                          placeholder="Confirm Password"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className={`mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none ${
                            loading && "cursor-not-allowed opacity-70"
                          }`}
                        >
                          {loading ? "Signing up..." : "Sign Up"}
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          name="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                          type="text"
                          placeholder="Enter OTP"
                        />
                        <button
                          type="button"
                          onClick={handleOtpVerification}
                          className="mt-5 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                        >
                          Verify OTP
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
            <div
              className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
              }}
            ></div>
          </div>
        </form>
      </div>
    </>
  );
};

export default page;
