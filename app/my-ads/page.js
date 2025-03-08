"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";

const MyAdsPage = () => {
  const [ads, setAds] = useState([]);
  const router = useRouter();

  // Fetch ads created by the logged-in user
  const fetchMyAds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("User not logged in");
        return;
      }

      const { data, error } = await supabase
        .from("user_ads")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const processedAds = data.map(ad => ({
        ...ad,
        images: ad.images ? (Array.isArray(ad.images) ? ad.images : JSON.parse(ad.images)) : [],
        selectedImageIndex: 0
      }));

      setAds(processedAds);
    } catch (error) {
      // console.error("Error fetching user ads:", error.message);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const handleAdClick = (ad_id) => {
    router.push(`/ads/${ad_id}`);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen font-sans bg-gray-50 border-r mt-28 overflow-x-hidden"> {/* Added overflow-x-hidden */}
        <div className="p-4 mx-auto w-full max-w-[800px]"> {/* Parent container width */}
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
            Manage and view your Ads
          </h2>
          {ads.length > 0 ? (
            <div className="flex flex-col space-y-6">
              {ads.map((ad, adIndex) => (
                <div 
                  key={ad.ad_id}
                  className="bg-white shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 w-full max-w-[800px] mx-auto" // Card width and margin
                >
                  <div className="flex flex-row p-4 lg:p-6"> {/* Responsive padding */}
                    {/* Image Section - Left Side */}
                    <div className="w-1/3 flex items-center justify-center"> {/* Centered image */}
                      <div className="relative h-40 w-full"> {/* Image container */}
                        <img
                          src={ad.images[ad.selectedImageIndex]}
                          alt={ad.ad_title}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Details Section - Right Side */}
                    <div className="w-2/3 pl-4 lg:pl-6 flex flex-col justify-between"> {/* Responsive padding */}
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{ad.ad_title}</h3>
                        <p className="text-gray-600 text-base mb-4">{ad.description}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-purple-600 font-bold text-xl">PKR {ad.price}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click event
                            handleAdClick(ad.ad_id);
                          }}
                          className="px-6 py-2 bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                          style={{ borderRadius: "0px 40px 0px 40px" }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl shadow">
              <p className="text-gray-600 text-lg">No ads found</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default MyAdsPage;