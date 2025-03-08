"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useParams } from "next/navigation";
import { 
  FaHeart, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaTag, 
  FaCheckCircle,
  FaWhatsapp,
  FaChevronLeft,
  FaChevronRight 
} from "react-icons/fa";
import BrandLogoSlider from "@/app/components/BrandLogoSlider";

const AdViewPage = () => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const params = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_ads")
          .select("*")
          .eq("ad_id", params.adId)
          .single();

        if (error) throw error;

        const processedAd = {
          ...data,
          images: data.images
            ? Array.isArray(data.images)
              ? data.images
              : JSON.parse(data.images)
            : [],
        };

        setAd(processedAd);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching ad details:", error);
        setLoading(false);
      }
    };

    if (params.adId) {
      fetchAdDetails();
    }
  }, [params.adId]);

  const goToNextImage = useCallback(() => {
    if (ad?.images?.length) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === ad.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [ad?.images?.length]);

  const goToPreviousImage = useCallback(() => {
    if (ad?.images?.length) {
      setSelectedImageIndex((prevIndex) =>
        prevIndex === 0 ? ad.images.length - 1 : prevIndex - 1
      );
    }
  }, [ad?.images?.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPreviousImage();
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextImage, goToPreviousImage]);

  // Touch handlers for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNextImage();
    } else if (isRightSwipe) {
      goToPreviousImage();
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleContactSeller = () => {
    if (ad?.phone) {
      const formattedPhone = ad.phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=Hi, I'm interested in your ad: ${ad.ad_title}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert('Contact number not available');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p>Loading...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!ad) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p>Ad not found</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-20">
        <BrandLogoSlider/>
      </div>
      <div className="flex flex-col min-h-screen font-sans bg-gray-50 border-r mt-10">
        <div className="p-4 mx-auto max-w-7xl flex-grow">
          <div className="bg-white grid grid-cols-1 lg:grid-cols-5 gap-12 shadow-lg rounded-xl border-l-4 border-purple-600 hover:shadow-xl transition-shadow duration-300">
            {/* Images Section */}
            <div className="lg:col-span-3 text-center">
              <div 
                className="px-4 py-10 rounded-lg bg-gray-50 shadow-inner relative"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {/* Navigation Arrows */}
                {ad.images.length > 1 && (
                  <>
                    <button
                      onClick={goToPreviousImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-all duration-200"
                      aria-label="Previous image"
                    >
                      <FaChevronLeft className="text-gray-800 text-xl" />
                    </button>

                    <button
                      onClick={goToNextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg z-10 transition-all duration-200"
                      aria-label="Next image"
                    >
                      <FaChevronRight className="text-gray-800 text-xl" />
                    </button>
                  </>
                )}

                {/* Main Image */}
                <img
                  src={ad.images[selectedImageIndex]}
                  alt={`${ad.ad_title} - Image ${selectedImageIndex + 1}`}
                  className="w-4/5 aspect-[251/171] rounded-lg object-contain mx-auto"
                />

                {/* Favorite Button */}
                <button 
                  onClick={handleFavoriteToggle}
                  className={`absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full 
                    ${isFavorite 
                      ? "bg-red-600 text-white" 
                      : "bg-white/50 text-gray-600"
                    } hover:scale-110 transition-transform duration-200`}
                >
                  <FaHeart />
                </button>
              </div>

              {/* Thumbnail Navigation */}
              <div className="mt-6 flex  justify-center gap-4 mx-auto">
                {ad.images.map((image, imageIndex) => (
                  <div
                    key={imageIndex}
                    className={`w-20 h-16 sm:w-24 sm:h-20 flex items-center justify-center rounded-lg p-2 
                      ${
                        selectedImageIndex === imageIndex
                          ? "ring-2 ring-purple-600 shadow-lg bg-purple-50"
                          : "shadow-md hover:shadow-lg bg-white"
                      } 
                      cursor-pointer transition-all duration-200`}
                    onClick={() => setSelectedImageIndex(imageIndex)}
                  >
                    <img
                      src={image}
                      alt={`${ad.ad_title} thumbnail ${imageIndex + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Details Section */}
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-lg">
              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">
                  Title
                </label>
                <h3 className="text-2xl font-bold text-gray-800 pb-2 border-b border-gray-100">
                  {ad.ad_title}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <FaTag className="text-purple-600" />
                  <span className="text-gray-700 font-medium">{ad.brand}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-purple-600" />
                  <span className="text-gray-700 capitalize">{ad.condition}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-purple-600 mb-1 block">
                  Description
                </label>
                <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {ad.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-purple-600 mb-1 block">
                    Price
                  </label>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">
                      PKR {ad.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-purple-600 mb-1 block">
                    Location
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg flex items-center space-x-2">
                    <FaMapMarkerAlt className="text-purple-600" />
                    <p className="text-gray-700">{ad.location}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-purple-600" />
                  <span className="text-gray-700">{ad.name || 'Seller Name'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaPhone className="text-purple-600" />
                  <span className="text-gray-700">{ad.phone || 'Contact Not Available'}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleContactSeller}
                  className="w-full px-6 py-3 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium bg-green-500 flex items-center bg-gradient-to-r from-blue-700 to-[#B06AB3] justify-center"
                >
                  <FaWhatsapp className="text-xl md:mr-2" />
                  <span>Contact on WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AdViewPage;