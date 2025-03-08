"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaFilter, FaTimes, FaHeart, FaThLarge, FaList } from "react-icons/fa";
import BrandLogoSlider from "../components/BrandLogoSlider";
import { useRouter } from "next/navigation";
import Loader from "../components/Loader";
import { useSearchParams } from "next/navigation";
import StickyButton from "../components/StickyButton";

// Define sectors for each location
const locationSectors = {
  "Islamabad Capital Territory, Pakistan": [
    "Sector F-5",
    "Sector G-6",
    "Sector H-8",
    "Sector I-9",
    "Sector D-12",
    "Other",
  ],
  "Azad Kashmir, Pakistan": ["Muzaffarabad", "Mirpur", "Rawalakot", "Other"],
  "Balochistan, Pakistan": ["Quetta", "Gwadar", "Khuzdar", "Other"],
  "Khyber Pakhtunkhwa, Pakistan": ["Peshawar", "Abbottabad", "Mardan", "Other"],
  "Northern Areas, Pakistan": ["Gilgit", "Skardu", "Hunza", "Other"],
  "Punjab, Pakistan": ["Lahore", "Faisalabad", "Rawalpindi", "Other"],
  "Sindh, Pakistan": ["Karachi", "Hyderabad", "Sukkur", "Other"],
};

const AdsPage = () => {
  const [ads, setAds] = useState([]);
  const [visibleAds, setVisibleAds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [user, setUser] = useState(null);
  const sidebarRef = useRef(null);
  const [favoriteAds, setFavoriteAds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isListView, setIsListView] = useState(true);

  // Filter States
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedSectors, setSelectedSectors] = useState([]); // New state for sectors
  const [priceRange, setPriceRange] = useState([250, 1000000]); // Min and Max Price

  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // Fetch Ads and User
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true); // Start loading
        const { data, error } = await supabase.from("user_ads").select("*");
        if (error) throw error;

        const processedAds = data.map((ad) => ({
          ...ad,
          images: ad.images
            ? Array.isArray(ad.images)
              ? ad.images
              : JSON.parse(ad.images)
            : [],
        }));

        setAds(processedAds);

        // Add 2 second delay after successful fetch
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (error) {
        console.error("Error fetching ads:", error.message);
        setLoading(false); // Error case mein loading turant band kar dein
      }
    };

    fetchAds();
  }, []);

  // Single, consolidated useEffect for updating visible ads
  useEffect(() => {
    const filteredAds = filterAds(ads);
    const adsToShow = filteredAds.slice(0, currentPage * 12);
    setVisibleAds(adsToShow);
  }, [
    ads,
    currentPage,
    selectedLocation,
    selectedBrands,
    selectedConditions,
    selectedSectors, // Include selectedSectors in dependency array
    priceRange,
    searchQuery,
  ]);

  // Filter Ads Function
  const filterAds = (ads) => {
    return ads.filter((ad) => {
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = ad.ad_title?.toLowerCase().includes(searchLower);
        const descMatch = ad.description?.toLowerCase().includes(searchLower);
        const brandMatch = ad.brand?.toLowerCase().includes(searchLower);

        if (!titleMatch && !descMatch && !brandMatch) {
          return false;
        }
      }

      // Filter by Location
      if (selectedLocation && ad.location !== selectedLocation) {
        return false;
      }

      // Filter by Brand
      if (selectedBrands.length > 0 && !selectedBrands.includes(ad.brand)) {
        return false;
      }

      // Filter by Condition
      if (
        selectedConditions.length > 0 &&
        !selectedConditions.includes(ad.condition)
      ) {
        return false;
      }

      // Filter by Sector
      if (
        selectedSectors.length > 0 &&
        !selectedSectors.includes(ad.sector)
      ) {
        return false;
      }

      // Filter by Price Range
      if (ad.price < priceRange[0] || ad.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  };

  // Handle Click Outside Sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarVisible(false);
      }
    };

    if (isSidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarVisible]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  // Handle Favourite Click
  const handleFavouriteClick = async (event, adId) => {
    event.stopPropagation();
    if (!user) {
      alert("Please login to add to favourites");
      return;
    }

    try {
      const newFavorites = new Set(favoriteAds);
      let action; // Track whether we are adding or removing

      if (newFavorites.has(adId)) {
        // Remove from favorites
        newFavorites.delete(adId);
        action = "delete";
      } else {
        // Add to favorites
        newFavorites.add(adId);
        action = "insert";
      }

      setFavoriteAds(newFavorites); // Update UI immediately

      let supabaseQuery;
      if (action === "insert") {
        supabaseQuery = supabase
          .from("user_fav_ads")
          .insert([{ user_id: user.id, ad_id: adId }]);
      } else {
        supabaseQuery = supabase
          .from("user_fav_ads")
          .delete()
          .eq("user_id", user.id)
          .eq("ad_id", adId);
      }

      const { error } = await supabaseQuery;
      if (error) {
        console.error("Error updating favorites:", error);
        alert(`Error: ${error.message}`);
        return;
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Something went wrong!");
    }
  };

  // Load More Ads
  const loadMoreAds = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  // Reset Filters Function
  const resetFilters = () => {
    setSelectedLocation("");
    setSelectedBrands([]);
    setSelectedConditions([]);
    setSelectedSectors([]); // Reset sectors
    setPriceRange([250, 1000000]); // Reset to default price range
    setCurrentPage(1); // Reset to the first page
    setSearchQuery(""); // Reset search query
    router.push("/Ads"); // Clear URL search params
  };

  // Handle Sticky Button Click
  const handleStickyButtonClick = () => {
    if (user) {
      // User is logged in, redirect to /Ads
      router.push("/AdPost");
    } else {
      // User is not logged in, redirect to /register
      router.push("/register");
    }
  };

  // Handle Click Outside Sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        event.stopPropagation(); // Prevent click from propagating to ads
        setIsSidebarVisible(false);
      }
    };

    if (isSidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarVisible]);

  // Handle Ad Click
  const handleAdClick = (adId) => {
    if (!isSidebarVisible) {
      // Only navigate to ad details if sidebar is not visible
      router.push(`/AdView/${adId}`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="mt-20">
        <BrandLogoSlider />
      </div>

      <div className="flex flex-col min-h-screen mt-10 relative">
        {/* Sticky Button */}
        <StickyButton
          buttonText="Sell"
          onClick={handleStickyButtonClick} // Pass the click handler
        />

        {/* Overlay for Small Devices */}
        {isSidebarVisible && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setIsSidebarVisible(false)}
          ></div>
        )}

        <div className="flex flex-row md:px-1 md:py-4 mx-auto w-full max-w-[1500px] gap-3 relative">
          {/* Filter Button for Mobile */}
          <button
            className="lg:hidden fixed bottom-6 left-6 z-50  bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white p-3 rounded-full shadow-lg"
            onClick={() => setIsSidebarVisible(true)}
          >
            <FaFilter size={20} />
          </button>

          {/* Sidebar for Filters */}
          <div
            ref={sidebarRef}
            className={`w-[75%] sm:w-[50%] mt-16 md:mt-3 lg:w-[20%] bg-white p-4 rounded shadow-md space-y-8 flex-shrink-0 
              fixed lg:relative top-0 left-0 h-full z-40 
              transition-transform duration-500 ease-in-out  overflow-auto
              ${
                isSidebarVisible
                  ? "translate-x-0 opacity-100  z-[100]"
                  : "-translate-x-full lg:translate-x-0 opacity-100"
              }
            `}
          >
            {/* Close Button for Mobile */}
            <button
              className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-black transition-all"
              onClick={() => setIsSidebarVisible(false)}
            >
              <FaTimes size={22} />
            </button>

            {/* Location Filter */}
            <div className="space-y-4">
              <label className="block text-sm text-gray-700 font-semibold">
                Location
              </label>
              <select
                className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  setSelectedSectors([]); // Reset sectors when location changes
                }}
              >
                <option value="">All Locations</option>
                <option>Punjab, Pakistan</option>
                <option>Sindh, Pakistan</option>
                <option>Islamabad Capital Territory, Pakistan</option>
                <option>Khyber Pakhtunkhwa, Pakistan</option>
                <option>Balochistan, Pakistan</option>
                <option>Azad Kashmir, Pakistan</option>
                <option>Northern Areas, Pakistan</option>
              </select>
            </div>

{/* Sector Filter */}
{selectedLocation && locationSectors[selectedLocation] && (
  <div className="space-y-4">
    <label className="block text-sm font-medium text-gray-700">
      Sector
    </label>
    <div className="relative">
      <select
        className="w-full px-4 py-3 pr-10 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none"
        value={selectedSectors}
        onChange={(e) =>
          setSelectedSectors(
            Array.from(
              e.target.selectedOptions,
              (option) => option.value
            )
          )
        }
        multiple // Allow multiple selections
      >
        {locationSectors[selectedLocation].map((sector, index) => (
          <option
            key={index}
            value={sector}
            className="text-sm text-gray-700 hover:bg-purple-50"
          >
            {sector}
          </option>
        ))}
      </select>
      {/* Dropdown Arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
    {/* Selected Sectors Display */}
    {selectedSectors.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedSectors.map((sector, index) => (
          <div
            key={index}
            className="flex items-center px-3 py-1 text-sm text-purple-700 bg-purple-50 rounded-full"
          >
            {sector}
            <button
              onClick={() =>
                setSelectedSectors(
                  selectedSectors.filter((s) => s !== sector)
                )
              }
              className="ml-2 text-purple-500 hover:text-purple-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm text-gray-600 font-bold">
                Price
              </label>
              <input
                type="range"
                min="250"
                max="1000000"
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                }
                className="w-full mt-1"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>PKR 250</span>
                <span>PKR 10 Lacs</span>
              </div>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm text-gray-600 font-bold">
                Brand
              </label>
              <div className="space-y-2">
                {[
                  "Apple iPhone",
                  "Motorola",
                  "Xiaomi",
                  "Google",
                  "HTC",
                  "BlackBerry",
                  "itel Mobile",
                  "Acer",
                  "Samsung Mobile",
                  "Nokia",
                  "OPPO",
                  "One Plus",
                  "LG",
                  "Sony",
                  "Lenovo",
                  "Huawei",
                  "Honor",
                  "Infinix Mobile",
                  "BLU Products",
                  "Tecno Spark",
                  "Karbonn Mobiles",
                  "Realme",
                ].map((brand, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={brand}
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBrands([...selectedBrands, brand]);
                        } else {
                          setSelectedBrands(
                            selectedBrands.filter((b) => b !== brand)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={brand}
                      className="ml-2 text-sm text-gray-600"
                    >
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Condition Filter */}
            <div>
              <label className="block text-sm text-gray-600 font-bold">
                Condition
              </label>
              <div className="space-y-2">
                {["used", "new"].map((condition, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={condition}
                      checked={selectedConditions.includes(condition)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedConditions([
                            ...selectedConditions,
                            condition,
                          ]);
                        } else {
                          setSelectedConditions(
                            selectedConditions.filter((c) => c !== condition)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={condition}
                      className="ml-2 text-sm text-gray-600"
                    >
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={resetFilters}
              className="text-white px-4 py-2 rounded-md mt-4 w-full bg-gradient-to-r from-blue-700 to-[#B06AB3] sm:block lg:hidden"
            >
              Reset Filters
            </button>

            {/* Reset Filters Button */}
            <button
              onClick={resetFilters}
              className=" text-white px-4 py-2 rounded-md mt-4 w-full bg-gradient-to-r from-blue-700 to-[#B06AB3] "
            >
              Reset Filters
            </button>
          </div>

          {/* Ads Grid */}
          <div className="flex-grow font-[sans-serif] p-4 w-full px-4 md:px-8 lg:px-12">
            {/* Add View Toggle Buttons */}
            <div className="flex justify-end mb-4 gap-2">
              <button
                onClick={() => setIsListView(false)}
                className={`p-2 rounded-md ${
                  !isListView
                    ? "bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <FaThLarge size={20} />
              </button>
              <button
                onClick={() => setIsListView(true)}
                className={`p-2 rounded-md ${
                  isListView
                    ? "bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <FaList size={20} />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader />
              </div>
            ) : (
              <>
                <div
                  className={`
        ${
          isListView
            ? "space-y-4"
            : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2"
        }
      `}
                >
                  {visibleAds.length > 0 ? (
                    visibleAds.map((ad) => (
                      <div
                        key={ad.ad_id}
                        className={`bg-white border overflow-hidden rounded-lg cursor-pointer hover:border-blue-600 transition-all relative
                ${
                  isListView
                    ? "flex flex-col sm:flex-row shadow-sm hover:shadow-md"
                    : ""
                }`}
                        onClick={() => handleAdClick(ad.ad_id)}
                      >
              <div className={`bg-gray-50 overflow-hidden flex items-center justify-center
  ${isListView 
    ? 'w-full sm:w-60 h-48 sm:h-60 flex-shrink-0' 
    : 'mx-auto rounded-b-2xl aspect-[281/218]'}`}>
  <img
    src={ad.images[0] || "https://via.placeholder.com/281x218"}
    alt={ad.ad_title}
    className={`${isListView 
      ? 'w-full h-full object-contain' 
      : 'w-full h-full object-contain'}`}
  />
</div>

                        <div
                          className={`${
                            isListView
                              ? "flex-grow flex flex-col justify-between p-4 sm:p-6"
                              : "p-4"
                          }`}
                        >
                          <div>
                            <div
                              className={`${isListView ? "flex justify-between items-start mb-2" : ""}`}
                            >
                              <h3
                                className={`font-bold text-gray-800 ${isListView ? "text-lg mb-2" : "text-sm sm:text-base"}`}
                              >
                                {ad.ad_title}
                              </h3>
                              {isListView && (
                                <h4 className="text-lg font-bold text-blue-600">
                                  PKR {ad.price.toLocaleString()}
                                </h4>
                              )}
                            </div>

                            <p
                              className={`text-gray-600 ${isListView ? "mb-2 line-clamp-2" : "truncate"}`}
                            >
                              {ad.description}
                            </p>

                            <div
                              className={`${isListView ? "flex items-center gap-4 text-sm text-gray-500" : ""}`}
                            >
                              <p
                                className={`text-gray-600 ${isListView ? "flex items-center gap-1" : "truncate"}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`${isListView ? "h-4 w-4" : "hidden"}`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                {ad.location}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`flex items-center ${isListView ? "justify-between mt-4 pt-4 border-t" : "justify-between gap-2 mt-4"}`}
                          >
                            <button
                              onClick={(event) =>
                                handleFavouriteClick(event, ad.ad_id)
                              }
                              className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full transition-all
                      ${
                        favoriteAds.has(ad.ad_id)
                          ? "bg-red-800 text-white"
                          : "bg-gray-100 text-gray-500"
                      }
                      hover:bg-gray-200`}
                            >
                              <FaHeart />
                            </button>

                            {!isListView && (
                              <h4 className="text-sm sm:text-base text-gray-800 font-bold">
                                PKR {ad.price.toLocaleString()}
                              </h4>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-600 col-span-full">
                      No ads available.
                    </p>
                  )}
                </div>

                {/* Load More Button */}
                {filterAds(ads).length > visibleAds.length && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={loadMoreAds}
                      className="bg-blue-600 text-white px-6 py-2 rounded-full transition-all bg-gradient-to-r from-blue-700 to-[#B06AB3]"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default function AdsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdsPage />
    </Suspense>
  );
}