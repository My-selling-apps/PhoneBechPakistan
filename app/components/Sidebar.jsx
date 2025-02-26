"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import {
  FaHome,
  FaUsers,
  FaUserFriends,
  FaMapPin,
  FaSignOutAlt,
  FaUser,
  FaClipboardList,
  FaMapMarkedAlt,
  FaFilter,
  FaMapMarkerAlt,
  FaTags,
  FaBoxOpen,
  FaCheckCircle,
  FaHeart,
  FaShoppingCart,
  FaAd,
} from "react-icons/fa";

const Sidebar = ({ onSidebarStateChange }) => {
  const router = useRouter();
  const [isSidebarHidden, setIsSidebarHidden] = useState(true);
  const sidebarRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();

      if (session?.session?.user) {
        setUser(session.session.user);
      }
    };

    fetchUser();
  }, []);

  const handleMouseEnter = () => {
    setIsSidebarHidden(false);
    if (onSidebarStateChange) {
      onSidebarStateChange(true);
    }
  };

  const handleMouseLeave = () => {
    setIsSidebarHidden(true);
    if (onSidebarStateChange) {
      onSidebarStateChange(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear Supabase session
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error during logout:", error.message);
        return;
      }

      // Remove Supabase-related tokens from local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("sb-")) {
          localStorage.removeItem(key);
        }
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("An error occurred during logout:", error.message);
    }
  };

  return (
    <nav
      ref={sidebarRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`bg-[#ffff] shadow-xl border-r border-gray-100 h-[calc(100vh-64px)] fixed top-16 left-0 transition-all duration-300 ${
        isSidebarHidden
          ? "w-14 overflow-hidden"
          : "w-64 md:w-80 overflow-scroll navbar"
      } py-10 px-4 font-sans flex flex-col z-40`}
    >
      {/* Profile Section */}
      {/* Profile Section */}
      {!isSidebarHidden && (
        <div className="flex items-center flex-col mb-8 group">
          {user ? (
            <>
              {/* User is logged in */}
              <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="User Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-black text-white text-lg font-bold uppercase">
                    {user.email.charAt(0)}
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                {user.user_metadata?.full_name ? (
                  <p className="text-xl font-bold text-gray-800">
                    {user.user_metadata.full_name}
                  </p>
                ) : null}
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </>
          ) : (
            /* User is not logged in */
            <button
              onClick={() => router.push("/login")} // Navigate to the login page
              className="px-28 py-2.5 bg-[#5FBDFF] text-white rounded-lg text-sm font-medium transition-all duration-300"
            >
              Login
            </button>
          )}
        </div>
      )}

      <hr className="border-gray-200 mb-6" />

      {/* Sidebar Links */}
      <ul className="space-y-2">
        {/* Sell Section - Updated Icon */}
        <SidebarLink
          href="/AdPost"
          icon={<FaShoppingCart className="text-xl text-[#4635B1]" />}
          isSidebarHidden={isSidebarHidden}
        >
          Sell
        </SidebarLink>

        {/* My Ads Section */}
        <SidebarLink
          href="/my-ads"
          icon={<FaAd className="text-xl text-[#4635B1]" />}
          isSidebarHidden={isSidebarHidden}
        >
          My Ads
        </SidebarLink>

        {/* Favourites Section */}
        <SidebarLink
          href="/favourites"
          icon={<FaHeart className="text-xl text-[#4635B1]" />}
          isSidebarHidden={isSidebarHidden}
        >
          Favourites
        </SidebarLink>

        <SidebarLink
          href="/profile"
          icon={<FaUser className="text-xl text-[#4635B1]" />}
          isSidebarHidden={isSidebarHidden}
        >
          Profile
        </SidebarLink>
      </ul>

      <hr className="border-gray-200 my-6" />

      {/* Filters Section */}
      <div className="space-y-4">
        <h3
          className={`text-xl ${
            isSidebarHidden ? "text-center" : "text-left"
          } font-semibold text-gray-700`}
        >
          {isSidebarHidden ? (
            <FaFilter className="mx-auto text-xl text-[#4635B1]" />
          ) : (
            "Filters"
          )}
        </h3>

        {/* Location Filter */}
        {!isSidebarHidden && (
          <div className="space-y-4">
            <label className="block text-sm text-gray-700 font-semibold">
              Location
            </label>
            <select className="w-full mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Pakistan
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Punjab
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Sindh
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Islamabad Capital Territory
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Khyber Pakhtunkhwa
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Balochistan
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Azad Kashmir
              </option>
              <option className="p-2 hover:bg-purple-100 hover:text-purple-600">
                Northern Areas
              </option>
            </select>
          </div>
        )}
        {isSidebarHidden && (
          <SidebarLink
            href="/location"
            icon={<FaMapMarkerAlt className="text-xl text-[#4635B1]" />}
            isSidebarHidden={isSidebarHidden}
          >
            Location
          </SidebarLink>
        )}

        {/* Price Range Filter */}
        {!isSidebarHidden && (
          <div>
            <label className="block text-sm text-gray-600">Price</label>
            <input
              type="range"
              min="250"
              max="1000000"
              className="w-full mt-1"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>PKR 250</span>
              <span>PKR 10 Lacs</span>
            </div>
          </div>
        )}
        {isSidebarHidden && (
          <SidebarLink
            href="/price"
            icon={<FaTags className="text-xl text-[#4635B1]" />}
            isSidebarHidden={isSidebarHidden}
          >
            Price
          </SidebarLink>
        )}

        {/* Is Deliverable Filter
        {!isSidebarHidden && (
          <div>
            <label className="block text-sm text-gray-600">
              Is Deliverable
            </label>
            <div className="flex text-sm items-center">
              <input type="checkbox" className="mr-2" />
              <span>Yes</span>
            </div>
            <div className="flex text-sm items-center">
              <input type="checkbox" className="mr-2" />
              <span>No</span>
            </div>
          </div>
        )} */}
        {isSidebarHidden && (
          <SidebarLink
            href="/deliverable"
            icon={<FaCheckCircle className="text-xl text-[#4635B1]" />}
            isSidebarHidden={isSidebarHidden}
          >
            Deliverable
          </SidebarLink>
        )}

        {/* Brand Filter */}
        {!isSidebarHidden && (
          <div>
            <label className="block text-sm text-gray-600">Brand</label>
            <div className="space-y-2">
              <div>
                <input type="checkbox" id="apple" />
                <label htmlFor="apple" className="ml-2 text-sm text-gray-600">
                  Apple iPhone
                </label>
              </div>
              <div>
                <input type="checkbox" id="samsung" />
                <label htmlFor="samsung" className="ml-2 text-sm text-gray-600">
                  Samsung Mobile
                </label>
              </div>
              <div>
                <input type="checkbox" id="vivo" />
                <label htmlFor="vivo" className="ml-2 text-sm text-gray-600">
                  Vivo
                </label>
              </div>
              <div>
                <input type="checkbox" id="infinix" />
                <label htmlFor="infinix" className="ml-2 text-sm text-gray-600">
                  Infinix
                </label>
              </div>
              <div>
                <input type="checkbox" id="oppo" />
                <label htmlFor="oppo" className="ml-2 text-sm text-gray-600">
                  OPPO
                </label>
              </div>
              <div>
                <input type="checkbox" id="oneplus" />
                <label htmlFor="oneplus" className="ml-2 text-sm text-gray-600">
                  One Plus
                </label>
              </div>
            </div>
          </div>
        )}
        {isSidebarHidden && (
          <SidebarLink
            href="/brand"
            icon={<FaTags className="text-xl text-[#4635B1]" />}
            isSidebarHidden={isSidebarHidden}
          >
            Brand
          </SidebarLink>
        )}

        {/* Condition Filter */}
        {!isSidebarHidden && (
          <div>
            <label className="block text-sm text-gray-600">Condition</label>
            <div className="space-y-2">
              <div>
                <input type="checkbox" id="used" />
                <label htmlFor="used" className="ml-2 text-sm text-gray-600">
                  Used
                </label>
              </div>
              <div>
                <input type="checkbox" id="new" />
                <label htmlFor="new" className="ml-2 text-sm text-gray-600">
                  New
                </label>
              </div>
            </div>
          </div>
        )}
        {isSidebarHidden && (
          <SidebarLink
            href="/condition"
            icon={<FaBoxOpen className="text-xl text-[#4635B1]" />}
            isSidebarHidden={isSidebarHidden}
          >
            Condition
          </SidebarLink>
        )}
      </div>

      {/* Logout Section */}
      {user && (
        <div className="mt-10">
          <hr className="border-gray-200 mb-4" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center text-red-600 hover:bg-red-50 p-3 rounded-lg transition-colors"
          >
            <FaSignOutAlt className="text-xl text-black" />
            {!isSidebarHidden && <span className="ml-3 text-sm">Logout</span>}
          </button>
        </div>
      )}
    </nav>
  );
};

// Sidebar Link Component
const SidebarLink = ({ href, icon, children, isSidebarHidden }) => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      setUser(session?.session?.user);
    };
    fetchUser();
  }, []);

  const handleNavigation = () => {
    if (user) {
      router.push(href); // Navigate to the page if authenticated
    } else {
      router.push("/login"); // Redirect to login if unauthenticated
    }
  };

  return (
    <li>
      <button
        onClick={handleNavigation}
        className={`flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 py-3 w-full rounded-lg transition-all ${
          isSidebarHidden ? "justify-center" : "justify-start"
        }`}
      >
        <div
          className={`text-2xl transition-all ${
            isSidebarHidden
              ? "bg-gradient-to-r from-blue-700 to-[#B06AB3] text-transparent bg-clip-text"
              : "text-[#4635B1]"
          } ${isSidebarHidden ? "mx-auto" : "mr-3"}`}
        >
          {icon}
        </div>

        {!isSidebarHidden && (
          <span className="text-sm font-medium">{children}</span>
        )}
      </button>
    </li>
  );
};

export default Sidebar;
