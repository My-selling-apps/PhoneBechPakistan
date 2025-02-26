"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const MyAdsPage = () => {
  const [ads, setAds] = useState([]);
  const [editIndex, setEditIndex] = useState(null); // Track which ad is being edited
  const [editedAd, setEditedAd] = useState(null); // Store changes temporarily

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

  const handleDeleteAd = async (ad_id, images) => {
    try {
      if (images.length > 0) {
        const extractedPaths = images.map((url) => url.split("ads-images/")[1]);
        const { error: storageError } = await supabase.storage
          .from("ads-images")
          .remove(extractedPaths);

        if (storageError) {
          console.error("Error deleting images from storage:", storageError.message);
          return;
        }
      }

      const { error: deleteError } = await supabase
        .from("user_ads")
        .delete()
        .eq("ad_id", ad_id);

      if (deleteError) {
        console.error("Error deleting ad:", deleteError.message);
        return;
      }

      setAds((prevAds) => prevAds.filter((ad) => ad.ad_id !== ad_id));
      alert("Ad deleted successfully!");
    } catch (error) {
      console.error("Error deleting ad:", error.message);
    }
  };

  const handleImageClick = (adIndex, imageIndex) => {
    setAds((prevAds) => {
      const updatedAds = [...prevAds];
      updatedAds[adIndex].selectedImageIndex = imageIndex;
      return updatedAds;
    });
  };

  // Enable edit mode
  const handleEditAd = (index) => {
    setEditIndex(index);
    setEditedAd({ ...ads[index] }); // Copy current ad details to edit
  };

  // Handle field changes
  const handleFieldChange = (e, field) => {
    setEditedAd({ ...editedAd, [field]: e.target.value });
  };

  // Save changes
  const handleSaveAd = async () => {
    try {
      const { error } = await supabase
        .from("user_ads")
        .update({
          ad_title: editedAd.ad_title,
          description: editedAd.description,
          price: editedAd.price,
          location: editedAd.location,
        })
        .eq("ad_id", editedAd.ad_id);

      if (error) throw error;

      const updatedAds = [...ads];
      updatedAds[editIndex] = editedAd;
      setAds(updatedAds);
      setEditIndex(null);
      setEditedAd(null);
      alert("Ad updated successfully!");
    } catch (error) {
      console.error("Error updating ad:", error.message);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedAd(null);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen font-sans bg-gray-50 border-r mt-28">
        <div className="p-4 mx-auto max-w-7xl flex-grow">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
            Manage and view your Ads
          </h2>
          {ads.length > 0 ? (
            <div className="space-y-12">
              {ads.map((ad, adIndex) => (
                <div 
                  key={ad.ad_id} 
                  className="bg-white grid grid-cols-1 lg:grid-cols-5 gap-12 shadow-lg  rounded-xl border-l-4 border-purple-600 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Images Section - Left Side */}
                  <div className="lg:col-span-3 text-center">
                    <div className="px-4 py-10 rounded-lg bg-gray-50 shadow-inner relative">
                      <img
                        src={ad.images[ad.selectedImageIndex]}
                        alt={ad.ad_title}
                        className="w-4/5 aspect-[251/171] rounded-lg object-contain mx-auto"
                      />
                    </div>
                    <div className="mt-6 flex flex-wrap justify-center gap-4 mx-auto">
                      {ad.images.map((image, imageIndex) => (
                        <div
                          key={imageIndex}
                          className={`w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded-lg p-2 
                            ${ad.selectedImageIndex === imageIndex 
                              ? "ring-2 ring-purple-600 shadow-lg bg-purple-50" 
                              : "shadow-md hover:shadow-lg bg-white"} 
                            cursor-pointer transition-all duration-200`}
                          onClick={() => handleImageClick(adIndex, imageIndex)}
                        >
                          <img
                            src={image}
                            alt={`Ad image ${imageIndex + 1}`}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details Section - Right Side */}
                  <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-purple-600 mb-1 block">Title</label>
                      {editIndex === adIndex ? (
                        <input
                          type="text"
                          value={editedAd.ad_title}
                          onChange={(e) => handleFieldChange(e, "ad_title")}
                          className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                      ) : (
                        <h3 className="text-2xl font-bold text-gray-800 pb-2 border-b border-gray-100">
                          {ad.ad_title}
                        </h3>
                      )}
                    </div>

                    <div>
                      <label className="text-sm font-medium text-purple-600 mb-1 block">Description</label>
                      {editIndex === adIndex ? (
                        <textarea
                          value={editedAd.description}
                          onChange={(e) => handleFieldChange(e, "description")}
                          className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          rows={4}
                        />
                      ) : (
                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                          {ad.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-purple-600 mb-1 block">Price</label>
                        {editIndex === adIndex ? (
                          <input
                            type="number"
                            value={editedAd.price}
                            onChange={(e) => handleFieldChange(e, "price")}
                            className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <p className=" text-2xl font-bold text-purple-600">
                              PKR {ad.price}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* <div>
                        <label className="text-sm font-medium text-purple-600 mb-1 block">Location</label>
                        {editIndex === adIndex ? (
                          <input
                            type="text"
                            value={editedAd.location}
                            onChange={(e) => handleFieldChange(e, "location")}
                            className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                          />
                        ) : (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                              {ad.location}
                            </p>
                          </div>
                        )}
                      </div> */}
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                      {editIndex === adIndex ? (
                        <>
                          <button 
                            onClick={handleSaveAd} 
                            className=" px-10 py-1  text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium  bg-gradient-to-r from-blue-700 to-[#B06AB3]"
                           
                          >
                            Save Changes
                          </button>
                          <button 
                            onClick={handleCancelEdit} 
                            className=" px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                      
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditAd(adIndex)} 
                            className=" px-10 py-1  text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium  bg-gradient-to-r from-blue-700 to-[#B06AB3]"
                            
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteAd(ad.ad_id, ad.images)} 
                            className=" px-9 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                            
                          >
                            Delete
                          </button>
                        </>
                      )}
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
