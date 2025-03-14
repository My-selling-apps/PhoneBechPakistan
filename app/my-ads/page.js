"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      console.error("Error fetching user ads:", error.message);
    }
  };

  useEffect(() => {
    fetchMyAds();
  }, []);

  const handleAdClick = (ad_id) => {
    router.push(`/ads/${ad_id}`);
  };

  const handleDeleteAd = async (ad_id) => {
    try {
      const { error } = await supabase
        .from("user_ads")
        .delete()
        .eq("ad_id", ad_id);

      if (error) throw error;

      // Remove the deleted ad from the state
      setAds(ads.filter(ad => ad.ad_id !== ad_id));
      toast.success("Ad deleted successfully!");
    } catch (error) {
      console.error("Error deleting ad:", error.message);
      toast.error("Failed to delete ad");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen font-sans bg-gray-50 mt-28 overflow-x-hidden">
        <div className="p-4 mx-auto w-full max-w-[800px]">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-8 text-center">
            Manage and view your Ads
          </h2>
          {ads.length > 0 ? (
            <div className="flex flex-col space-y-4 sm:space-y-6">
              {ads.map((ad) => (
                <div 
                  key={ad.ad_id}
                  className="bg-white shadow-lg rounded-lg cursor-pointer hover:shadow-xl transition-shadow duration-300 w-full"
                >
                  <div className="flex flex-col sm:flex-row p-4 lg:p-6">
                    {/* Image Section - Top on Mobile, Left on Desktop */}
                    <div className="w-full sm:w-1/3 flex items-center justify-center mb-4 sm:mb-0">
                      <div className="relative h-48 sm:h-40 w-full">
                        <img
                          src={ad.images[ad.selectedImageIndex]}
                          alt={ad.ad_title}
                          className="w-full h-full object-contain rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Details Section - Bottom on Mobile, Right on Desktop */}
                    <div className="w-full sm:w-2/3 sm:pl-4 lg:pl-6 flex flex-col justify-between">
                      <div className="mb-4 sm:mb-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          {ad.ad_title}
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base line-clamp-2">
                          {ad.description}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <p className="text-purple-600 font-bold text-lg sm:text-xl">
                          PKR {ad.price}
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdClick(ad.ad_id);
                            }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                            // style={{ borderRadius: "0px 40px 0px 40px" }}
                          >
                            View
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAd(ad.ad_id);
                            }}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            // style={{ borderRadius: "0px 40px 0px 40px" }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 sm:p-12 bg-white rounded-xl shadow">
              <p className="text-gray-600 text-base sm:text-lg">No ads found</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
};

export default MyAdsPage;