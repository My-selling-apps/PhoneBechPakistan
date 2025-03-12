"use client";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import BrandLogoSlider from "./components/BrandLogoSlider";
import ImageSlider from "./components/ImageSlider";
import { useState, useEffect } from "react";
import VideoCardComponent from "./components/VideoCardComponent";
import AdsComponent from "./components/AdsComponent";
import Footer from "./components/Footer";
import Link from "next/link";
import StickyButton from "./components/StickyButton"; // Import the StickyButton component
import { supabase } from "./supabase"; // Import your Supabase client
import { useRouter } from "next/navigation"

export default function Home() {

  const [user, setUser] = useState(null); // State to track user login status
    const router = useRouter();

  useEffect(() => {
    // Ensuring the global styles are applied once the app is loaded
    document.documentElement.style.scrollBehavior = "smooth"; // Optional: for smooth scrolling

    // Fetch user session to check login status
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        setUser(session.session.user); // Set user if logged in
      }
    };

    fetchUser();
  }, []);

  const handleStickyButtonClick = () => {
    if (!user) {

      router.push("/register");
    } 
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow transition-all duration-300 ease-in-out pt-16">
        <div className="w-full">
          {/* BrandLogoSlider */}
          <div className="transition-all duration-300 ease-in-out w-full">
            <BrandLogoSlider />
          </div>

          {/* ImageSlider */}
          <div className="transition-all duration-300 ease-in-out w-full">
            <ImageSlider />
          </div>

          {/* Video Card Component */}
          <div>
            <VideoCardComponent />
          </div>

          {/* Boost Ad Section */}
          <div className="mt-9 md:mt-20">
            <div className="bg-gradient-to-r from-blue-700 to-[#B06AB3] font-sans px-6 py-5">
              <div className="container mx-auto flex flex-col justify-center items-center text-center">
                <h2 className="text-white sm:text-4xl text-3xl font-bold mb-4">
                  Boost Your Ads & Sell Faster!
                </h2>
                <p className="text-white text-base text-center mb-8">
                  Maximize your phone’s visibility and reach potential buyers
                  instantly. Promote your ad today and sell your device quickly
                  with premium exposure!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* AdsComponent */}
        <div className="mt-16">
          <AdsComponent />
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 text-white font-semibold bg-gradient-to-r from-blue-700 to-[#B06AB3] transition-all rounded-lg shadow-md"
            style={{ borderRadius: "0px 40px 0px 40px" }}
          >
            <Link href="/Ads">Explore More</Link>
          </button>
        </div>
      </main>

      {/* Footer */}
      <div className="mt-36">
        <Footer />
      </div>

      {/* Conditionally Render StickyButton */}
      {!user && <StickyButton  onClick={handleStickyButtonClick} />}
    </div>
  );
}