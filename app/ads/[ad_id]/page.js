"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import { useRouter } from "next/navigation";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Loader from "@/app/components/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const AdDetailPage = ({ params }) => {
  const [ad, setAd] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAd, setEditedAd] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [updatingImageIndex, setUpdatingImageIndex] = useState(null);
  const router = useRouter();

  const { ad_id } = React.use(params);

  const fetchAdDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("user_ads")
        .select("*")
        .eq("ad_id", ad_id)
        .single();

      if (error) throw error;

      const processedAd = {
        ...data,
        images: data.images ? (Array.isArray(data.images) ? data.images : JSON.parse(data.images)) : [],
        selectedImageIndex: 0
      };

      setAd(processedAd);
      setEditedAd(processedAd);
    } catch (error) {
      console.error("Error fetching ad details:", error.message);
    }
  };

  useEffect(() => {
    if (ad_id) {
      fetchAdDetails();
    }
  }, [ad_id]);

  const handleFieldChange = (e, field) => {
    setEditedAd({ ...editedAd, [field]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleUpdateImage = async (index) => {
    if (newImages.length === 0) return;

    const file = newImages[0];
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("ads-images")
      .upload(fileName, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from("ads-images")
      .getPublicUrl(fileName);

    const updatedImages = [...ad.images];
    updatedImages[index] = publicUrlData.publicUrl;

    setAd({ ...ad, images: updatedImages });
    setEditedAd({ ...editedAd, images: updatedImages });
    setNewImages([]);
    setUpdatingImageIndex(null);
  };

  const handleRemoveImage = async (index) => {
    try {
      const imageToRemove = ad.images[index];
      const updatedImages = ad.images.filter((_, i) => i !== index);

      // Update the ad in Supabase
      const { error } = await supabase
        .from("user_ads")
        .update({ images: updatedImages })
        .eq("ad_id", ad.ad_id);

      if (error) throw error;

      setAd({ ...ad, images: updatedImages });
      setEditedAd({ ...editedAd, images: updatedImages });
      toast("Image removed successfully!");
    } catch (error) {
      console.error("Error removing image:", error.message);
    }
  };

  const handleSaveAd = async () => {
    try {
      let updatedImages = ad.images;

      if (newImages.length > 0 && updatingImageIndex !== null) {
        await handleUpdateImage(updatingImageIndex);
        return;
      }

      if (newImages.length > 0) {
        const uploadedImages = await Promise.all(
          newImages.map(async (image) => {
            const fileName = `${Date.now()}-${image.name}`;
            const { data, error } = await supabase.storage
              .from("ads-images")
              .upload(fileName, image);

            if (error) throw error;

            const { data: publicUrlData } = supabase.storage
              .from("ads-images")
              .getPublicUrl(fileName);

            return publicUrlData.publicUrl;
          })
        );

        updatedImages = [...ad.images, ...uploadedImages].slice(0, 4);
      }

      const { error } = await supabase
        .from("user_ads")
        .update({
          ad_title: editedAd.ad_title,
          description: editedAd.description,
          price: editedAd.price,
          location: editedAd.location,
          images: updatedImages,
          phone: editedAd.phone, // Update phone number
        })
        .eq("ad_id", editedAd.ad_id);

      if (error) throw error;

      setAd({ ...editedAd, images: updatedImages });
      setEditMode(false);
      setNewImages([]);
      toast("Ad updated successfully!");
    } catch (error) {
      console.error("Error updating ad:", error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedAd(ad);
    setNewImages([]);
    setUpdatingImageIndex(null);
  };

  if (!ad) return <div className="flext justify-center  items-center"><Loader/></div>;

  return (
    <>
      <Navbar />
      <div className="flex flex-col min-h-screen font-sans bg-gray-50 border-r mt-28">
        <div className="p-4 mx-auto max-w-7xl flex-grow">
          <div className="bg-white grid grid-cols-1 lg:grid-cols-5 gap-12 shadow-lg rounded-xl border-purple-600">
            {/* Images Section - Left Side */}
            <div className="lg:col-span-3 text-center">
              <div className="px-4 py-10 rounded-lg bg-gray-50 shadow-inner relative">
                <img
                  src={ad.images[ad.selectedImageIndex]}
                  alt={ad.ad_title}
                  className="w-[100%] aspect-[251/171] rounded-lg object-contain mx-auto"
                />
              </div>
              <div className="mt-1 flex flex-wrap justify-center gap-4 mx-auto">
                {ad.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    className={`w-12 h-16 md:w-20 md:p-2 p-1 sm:h-20 flex items-center justify-center rounded-lg 
                      ${ad.selectedImageIndex === imageIndex 
                        ? "ring-2 ring-purple-600 shadow-lg bg-purple-50" 
                        : "shadow-md hover:shadow-lg bg-white"} 
                      cursor-pointer transition-all duration-200 relative`}
                    onClick={() => setAd({ ...ad, selectedImageIndex: imageIndex })}
                  >
                    <img
                      src={image}
                      alt={`Ad image ${imageIndex + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {editMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent image selection
                          handleRemoveImage(imageIndex);
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section - Right Side */}
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg">
              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">Title</label>
                {editMode ? (
                  <input
                    type="text"
                    value={editedAd.ad_title}
                    onChange={(e) => handleFieldChange(e, "ad_title")}
                    className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <h3 className="text-[16px] font-bold text-gray-800 pb-2 border-b border-gray-100">
                    {ad.ad_title}
                  </h3>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">Description</label>
                {editMode ? (
                  <textarea
                    value={editedAd.description}
                    onChange={(e) => handleFieldChange(e, "description")}
                    className="block w-full p-3 text-[16px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-600 text-[16px] leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {ad.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-0">
                <div>
                  <label className="text-sm font-medium text-purple-600 mb-1 block">Price</label>
                  {editMode ? (
                    <input
                      type="number"
                      value={editedAd.price}
                      onChange={(e) => handleFieldChange(e, "price")}
                      className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-[16px] font-bold text-purple-600">
                        PKR {ad.price}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Phone Number Section */}
              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={editedAd.phone}
                    onChange={(e) => handleFieldChange(e, "phone")}
                    className="block w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-[16px] font-bold text-purple-600">
                      {ad.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Add New Images Section */}
              {editMode && ad.images.length < 4 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-purple-600 mb-2">
                    Add New Images
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-4 mt-8 pt-0 border-t border-gray-100">
                {editMode ? (
                  <>
                    <button 
                      onClick={handleSaveAd} 
                      className="px-10 py-1 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium bg-gradient-to-r from-blue-700 to-[#B06AB3]"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={handleCancelEdit} 
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => setEditMode(true)} 
                      className="px-10 py-1 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium bg-gradient-to-r from-blue-700 to-[#B06AB3]"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => router.push("/my-ads")} 
                      className="px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
                    >
                      Back to My Ads
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
          <ToastContainer />
    </>
  );
};

export default AdDetailPage;


