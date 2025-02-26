"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaTrash } from "react-icons/fa";

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchFavourites = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase
          .from("user_fav_ads")
          .select("*, user_ads(*)")
          .eq("user_id", user.id);

        if (error) {
          console.error("Error fetching favourites:", error.message);
        } else {
          setFavourites(data.map(item => item.user_ads));
        }
      }
    };

    fetchFavourites();
  }, []);

  const handleRemoveFavourite = async (adId) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("user_fav_ads")
        .delete()
        .eq("user_id", user.id)
        .eq("ad_id", adId);

      if (error) {
        console.error("Error removing from favourites:", error.message);
        return;
      }

      setFavourites(prevFavourites => prevFavourites.filter(ad => ad.ad_id !== adId));
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen mt-20">
        <Navbar />
        <div className="flex-grow">
          <div className="p-4 mx-auto max-w-7xl">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">
              Your Favourites
            </h2>
  
            {favourites.length > 0 ? (
              <div className="max-w-[calc(100%-40px)] w-full mx-auto space-y-4 sm:space-y-6">
                {favourites.map((ad) => (
                  <div key={ad.ad_id} className="flex flex-col sm:flex-row border p-3 sm:p-4 rounded-lg shadow-sm bg-white w-full gap-3 sm:gap-0">
                    {/* Image Section */}
                    <div className="w-full sm:w-28 h-48 sm:h-28 flex-shrink-0">
                      <img
                        src={ad.images[0] || "https://via.placeholder.com/281x218"}
                        alt={ad.ad_title}
                        className="w-full h-full object-cover rounded-md"
                      />
                    </div>
  
                    {/* Details Section */}
                    <div className="flex-grow px-0 sm:px-4 space-y-2 sm:space-y-1">
                      <h3 className="text-lg font-semibold text-gray-900">{ad.ad_title}</h3>
                      <p className="text-sm text-gray-600">Rs {ad.price}</p>
                      <p className="text-sm text-gray-500">{ad.location}</p>
                    </div>
  
                    {/* Remove Button */}
                    <div className="flex items-center justify-end sm:justify-center">
                      <button
                        onClick={() => handleRemoveFavourite(ad.ad_id)}
                        className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 mt-10">No favourites found.</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default FavouritesPage;