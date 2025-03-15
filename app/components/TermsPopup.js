"use client";

import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import 'animate.css';

export default function TermsPopup({ user }) {
  const [termsAccepted, setTermsAccepted] = useState(false); // State to track terms acceptance
  const [showPopup, setShowPopup] = useState(false); // State to control popup visibility

  useEffect(() => {
    if (user) {
      checkTermsAcceptance(user.id); // Check if user has accepted terms
    }
  }, [user]);

  // Function to check if the user has already accepted the terms or closed the popup
  const checkTermsAcceptance = async (userId) => {
    try {
      // Check localStorage first
      const hasClosedPopup = localStorage.getItem(`popupClosed_${userId}`);
      if (hasClosedPopup === "true") {
        return; // Popup was closed, don't show it again
      }

      // Check Supabase for terms acceptance
      const { data, error } = await supabase
        .from("user_terms_acceptance")
        .select("accepted")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data && data.accepted) {
        setTermsAccepted(true); // User has already accepted the terms
      } else {
        setShowPopup(true); // Show popup if terms are not accepted
      }
    } catch (error) {
      console.error("Error checking terms acceptance:", error);
    }
  };

  // Function to handle terms acceptance
  const handleAcceptTerms = async () => {
    if (user) {
      try {
        // Insert or update the user's acceptance status in Supabase
        const { error } = await supabase
          .from("user_terms_acceptance")
          .upsert([{ user_id: user.id, accepted: true }], { onConflict: "user_id" });

        if (error) {
          throw error;
        }

        setTermsAccepted(true); // Update local state
        setShowPopup(false); // Hide the popup
      } catch (error) {
        console.error("Error accepting terms:", error);
      }
    }
  };

  // Function to close the popup and remember the user's choice
  const handleClosePopup = () => {
    if (user) {
      // Store a flag in localStorage to remember that the user closed the popup
      localStorage.setItem(`popupClosed_${user.id}`, "true");
    }
    setShowPopup(false); // Hide the popup
  };

  return (
    <>
      {showPopup && (
        <div className="fixed inset-0 flex items-end justify-center z-50">
          <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-[36rem] w-full mx-4  animate__animated animate__backInLeft">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Terms and Conditions</h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <p className="mb-4">
              Please accept our Terms and Conditions to continue using PhonebechPK.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleClosePopup}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={handleAcceptTerms}
                className="px-4 py-2 text-white rounded-lg hover:text-white bg-[#B06AB3]"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}