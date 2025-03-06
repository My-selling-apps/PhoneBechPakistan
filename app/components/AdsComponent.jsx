import React, { useEffect, useState } from 'react';
import { supabase } from "../supabase";

const AdsComponent = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchFeaturedAds = async () => {
      try {
        const { data: adsData, error: adsError } = await supabase
          .from('features_ads')
          .select('*')
          .order('created_at', { ascending: false });

        if (adsError) {
          console.error('Error fetching featured ads:', adsError);
          return;
        }

        console.log('Fetched Featured Ads:', adsData);

        const processedAds = await Promise.all(
          adsData.map(async (ad) => {
            let imageUrl = "";

            if (ad.images) {
              try {
                const parsedImages = typeof ad.images === 'string' 
                  ? JSON.parse(ad.images) 
                  : ad.images;

                if (Array.isArray(parsedImages) && parsedImages.length > 0) {
                  imageUrl = parsedImages[0];
                } else if (typeof parsedImages === 'string') {
                  imageUrl = parsedImages;
                }
              } catch (error) {
                console.error('Error parsing images:', error);
                imageUrl = ad.images;
              }
            }

            return { ...ad, imageUrl };
          })
        );

        console.log('Processed Featured Ads with Image URLs:', processedAds);
        setAds(processedAds);
      } catch (err) {
        console.error('Error processing featured ads:', err);
      }
    };

    fetchFeaturedAds();
  }, []);

  return (
    <div className="flex-grow font-[sans-serif] p-1 mx-auto lg:max-w-5xl max-w-2xl">
      <h2 className="text-xl sm:text-3xl font-extrabold text-gray-800 mb-6 sm:mb-8 text-center">Featured Phone Ads</h2>
  
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 sm:gap-6">
        {ads.length > 0 ? (
          ads.map((ad) => (
            // Added a fallback for the key in case feature_id is not available
            <div
              key={ad.feature_id || ad.ad_id || Math.random().toString()}
              className="bg-white border overflow-hidden rounded-2xl cursor-pointer hover:border-blue-600 transition-all relative"
            >
              <div className="bg-gray-50 overflow-hidden mx-auto rounded-b-2xl">
                <img
                  src={ad.imageUrl || "https://via.placeholder.com/281x218"}
                  alt={ad.ad_title}
                  className="aspect-[281/218] w-full object-contain"
                />
              </div>
  
              <div className="p-4">
                <h3 className="text-sm sm:text-base font-bold text-gray-800">
                  {ad.ad_title}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {ad.description}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {ad.location}
                </p>
                <div className="flex items-center justify-between gap-2 mt-4">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 flex items-center justify-center rounded-full hover:bg-gray-200 transition-all">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18px"
                      height="18px"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="text-gray-500 hover:text-red-500 transition-all"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
  
                  <h4 className="text-sm sm:text-base text-gray-800 font-bold">
                    PKR {ad.price}
                  </h4>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No featured ads available.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdsComponent;