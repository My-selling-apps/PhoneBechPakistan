"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import { FaAd, FaBan, FaStar, FaEnvelope } from "react-icons/fa";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("User Ads"); // Sidebar active tab
  const [ads, setAds] = useState([]); // Store ads data
  const [messages, setMessages] = useState([]); // Store contact form messages

  // Fetch ads based on active tab
  const fetchAds = async () => {
    // Prevent fetching ads when "User Messages" tab is active
    if (activeTab === "User Messages") return;

    try {
      let tableName;
      if (activeTab === "User Ads") {
        tableName = "user_ads";
      } else if (activeTab === "Rejected User Ads") {
        tableName = "rejected_user_ads";
      } else if (activeTab === "Featured Ads") {
        tableName = "features_ads";
      }

      const { data, error } = await supabase.from(tableName).select("*");
      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error.message);
    }
  };

  // Fetch user messages from the contact form
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_form_submissions")
        .select("*")
        .order("created_at", { ascending: false }); // Fetch the latest messages first

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  useEffect(() => {
    if (activeTab === "User Messages") {
      fetchMessages(); // Fetch messages when "User Messages" tab is active
    } else {
      fetchAds(); // Fetch ads only when the active tab is not "User Messages"
    }
  }, [activeTab]); // Trigger fetch when the active tab changes


  const handleDeleteAd = async (ad_id, images) => {
    try {
      let tableName;
      if (activeTab === "User Ads") {
        tableName = "user_ads";
      } else if (activeTab === "Rejected User Ads") {
        tableName = "rejected_user_ads";
      } else if (activeTab === "Featured Ads") {
        tableName = "features_ads";
      }

      // Step 1: Delete images from the bucket
      if (images) {
        let imagePaths = [];

        if (typeof images === "string") {
          try {
            imagePaths = JSON.parse(images);
          } catch (e) {
            imagePaths = [images];
          }
        } else if (Array.isArray(images)) {
          imagePaths = images;
        }

        // Delete images from the bucket
        for (const imagePath of imagePaths) {
          const fileName = imagePath.split("/").pop();
          const { error } = await supabase.storage
            .from("ads-images")
            .remove([fileName]);

          if (error) {
            console.error("Error deleting image:", fileName, error.message);
          } else {
            console.log("Image deleted successfully:", fileName);
          }
        }
      }

      // Step 2: Delete ad details from the table
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq("ad_id", ad_id);

      if (deleteError) throw deleteError;

      // Refresh the ads list after deletion
      setAds((prevAds) => prevAds.filter((ad) => ad.ad_id !== ad_id));
      alert("Ad and its images deleted successfully!");
    } catch (error) {
      console.error("Error deleting ad:", error.message);
    }
  };

  const handlePushToFeature = async (ad) => {
    try {
      const { data, error } = await supabase
        .from("features_ads")
        .insert([
          {
            ad_id: ad.ad_id,
            user_id: ad.user_id,
            ad_title: ad.ad_title,
            description: ad.description,
            price: ad.price,
            location: ad.location,
            images: Array.isArray(ad.images) ? ad.images : JSON.parse(ad.images),
          },
        ]);

      if (error) throw error;

      alert("Ad pushed to featured successfully!");
    } catch (error) {
      console.error("Error pushing ad to featured:", error.message);
    }
  };

  return (
    <div className="flex h-screen bg-white-100">
      {/* Sidebar */}
      <div className="w-1/6 bg-slate-900 text-white flex flex-col">
        <h1 className="text-lg font-bold text-center py-6 border-b border-gray-600">
          Admin Panel
        </h1>
        <button
          className={`py-4 px-6 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors ${
            activeTab === "User Ads" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("User Ads")}
        >
          <FaAd className="text-xl" /> User Ads
        </button>
        <button
          className={`py-4 px-6 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors ${
            activeTab === "Rejected User Ads" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("Rejected User Ads")}
        >
          <FaBan className="text-xl" /> Rejected User Ads
        </button>
        <button
          className={`py-4 px-6 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors ${
            activeTab === "Featured Ads" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("Featured Ads")}
        >
          <FaStar className="text-xl" /> Featured Ads
        </button>
        {/* Add a new tab for Contact Form Messages */}
        <button
          className={`py-4 px-6 text-left flex items-center gap-2 hover:bg-gray-700 transition-colors ${
            activeTab === "User Messages" ? "bg-gray-700" : ""
          }`}
          onClick={() => setActiveTab("User Messages")}
        >
          <FaEnvelope className="text-xl" /> User Messages
        </button>
      </div>

      {/* Content */}
      <div className="w-5/6 p-8 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">{activeTab}</h2>

        {/* Display Ads or Messages based on active tab */}
        {activeTab === "User Ads" || activeTab === "Rejected User Ads" || activeTab === "Featured Ads" ? (
          <>
            {ads.length === 0 ? (
              <p className="text-gray-500 text-lg">No ads to display.</p>
            ) : (
              <ul className="space-y-6">
                {ads.map((ad) => (
                  <li
                    key={ad.ad_id}
                    className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                          {ad.ad_title}
                        </h3>
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            <span className="font-bold text-gray-800">Description:</span>{" "}
                            {ad.description}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-bold text-gray-800">Price:</span> ${ad.price}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-bold text-gray-800">Location:</span>{" "}
                            {ad.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {activeTab !== "Featured Ads" && (
                          <button
                            onClick={() => handlePushToFeature(ad)}
                            className="px-5 py-2.5 rounded-lg text-sm tracking-wider font-medium border border-yellow-500 outline-none bg-transparent hover:bg-yellow-500 text-yellow-500 hover:text-white transition-all duration-300"
                          >
                            Push To Feature
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAd(ad.ad_id, ad.images)}
                          className="px-5 py-2.5 rounded-lg text-sm tracking-wider font-medium border border-black outline-none bg-transparent hover:bg-black text-black hover:text-white transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Display Images */}
                    <div className="flex gap-4 mt-4">
                      {ad.images &&
                        (Array.isArray(ad.images)
                          ? ad.images
                          : ad.images.startsWith("[")
                          ? JSON.parse(ad.images)
                          : [ad.images]
                        ).map((imageURL, index) => (
                          <img
                            key={index}
                            src={imageURL}
                            alt={`Ad Image ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                          />
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : activeTab === "User Messages" ? (
          <>
            {messages.length === 0 ? (
              <p className="text-gray-500 text-lg">No messages to display.</p>
            ) : (
              <ul className="space-y-6">
                {messages.map((message) => (
                  <li
                    key={message.id}
                    className="p-6 bg-white shadow-lg rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          {message.first_name} {message.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{message.email}</p>
                        <p className="text-sm text-gray-600">{message.phone_no}</p>
                        <div className="space-y-2 mt-4">
                          <p className="text-gray-600">
                            <span className="font-bold text-gray-800">Message:</span>{" "}
                            {message.message}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-bold text-gray-800">Subject:</span>{" "}
                            {message.subject}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminPanel;
