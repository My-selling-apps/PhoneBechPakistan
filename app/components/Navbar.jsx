"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "../supabase"; // Import your Supabase client
import { Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaSearch } from "react-icons/fa";
import { FaPhone } from "react-icons/fa";
import {
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaUserShield,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";
import { FaShoppingCart, FaAd, FaHeart, FaUser } from "react-icons/fa";
import { FaEnvelope } from "react-icons/fa";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProvider, setUserProvider] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Update this to match your actual ads page route
      router.push(`/Ads?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const loggedUser = session.session.user;
        setUser(loggedUser);

        // Fetch role from user_other_credentials
        const { data, error } = await supabase
          .from("user_other_credentials")
          .select("role")
          .eq("id", loggedUser.id)
          .maybeSingle();

        if (data && data.role) {
          setUserRole(data.role);
        } else {
          setUserRole("user");
        }

        // Fetch provider information
        // const provider = loggedUser?.app_metadata?.provider;
        // setUserProvider(provider);

        // // Fetch profile image from Supabase storage
        // const { data: profileData, error: profileError } =
        //   await supabase.storage
        //     .from("profiles_images")
        //     .getPublicUrl(`${loggedUser.id}.jpg`); // Use .jpg instead of .jpeg

        // if (profileError) {
        //   console.error("Error fetching profile image URL:", profileError);
        //   return;
        // }

        // if (profileData?.publicUrl) {
        //   console.log("Generated Profile URL:", profileData.publicUrl);
        //   setProfileImage(profileData.publicUrl);
        // } else {
        //   console.log("No profile image URL found");
        // }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Add this function to handle protected navigation
  const handleProtectedNavigation = (path) => {
    if (!user) {
      router.push("/login");
    } else {
      router.push(path);
    }
  };

  return (
    <nav className="flex items-center justify-between px-1 py-4 bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white fixed top-0 w-full z-50">
      {/* Left: Brand Name */}
      <div className="flex-shrink-0">
        <h1 className="text-xl font-bold ">
          <Link href="/">PHONE BECH</Link>
        </h1>
      </div>

      {/* Center/Right: Search Box */}
      <div className="flex-grow flex justify-end px-4 max-w-[31rem]">
        <form onSubmit={handleSearch} className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-10 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#53CFFF] transition-all duration-300 rounded-full"
            style={{ borderRadius: "0px 40px 0px 40px" }}
          />
          <button
            type="submit"
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          >
            <FaSearch size={20} className="text-gray-500 cursor-pointer" />
          </button>
        </form>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="block md:hidden mr-2"
      >
        <Menu size={24} />
      </button>

      {/* Desktop Menu Items */}
      <div className="hidden md:flex items-center space-x-4">
        <button className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2">
          <FaHome /> <Link href="/">Home</Link>
        </button>
        {user && (
          <>
            <button className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2">
              <FaPhone /> <Link href="/Ads">Phones</Link>
            </button>
            <button
              onClick={() => handleProtectedNavigation("/AdPost")}
              className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2 bg-gradient-to-r from-blue-700 to-[#B06AB3]"
              style={{ borderRadius: "0px 40px 0px 40px" }}
            >
              <FaShoppingCart /> <span>Sell</span>
            </button>

            <button
              onClick={() => handleProtectedNavigation("/my-ads")}
              className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2"
            >
              <FaAd /> <span>My Ads</span>
            </button>

            <button
              onClick={() => handleProtectedNavigation("/FavouritesPage")}
              className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2"
            >
              <FaHeart /> <span>Favourites</span>
            </button>

            <button
              onClick={() => handleProtectedNavigation("/profile")}
              className=" flex items-center gap-2 text-white hover:text-gray-200 transition-colors px-4 py-2"
            >
              <FaUser /> <span>Profile</span>
            </button>
          </>
        )}

        {user ? (
          <>
            {/* User Icon and Dropdown */}
            <div className="relative">
              <div
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-white cursor-pointer"
                onClick={toggleDropdown}
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="User"
                    width={40}
                    height={40}
                    className="object-cover"
                    // onError={() => setProfileImage(null)}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-[#5FBDFF] text-white text-lg font-bold uppercase bg-gradient-to-r from-blue-700 to-[#B06AB3]">
                    {user.email.charAt(0)}
                  </div>
                )}
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-48 bg-white rounded-lg shadow-lg py-4 z-50">
                  {userRole === "admin" && userProvider !== "google" && (
                    <button
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaUserShield /> <Link href="/AdminPanel">Admin</Link>
                    </button>
                  )}

                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                    <FaEnvelope size={14} />{" "}
                    <Link href="/ContactUs">Contact us</Link>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleLogin}
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm tracking-wider font-medium bg-white text-black border border-white outline-none bg-transparent hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
            >
              <FaSignInAlt /> Login
            </button>
            <button
              onClick={handleSignUp}
              type="button"
              className="px-5 py-2.5 rounded-lg text-sm tracking-wider font-medium bg-white text-black border border-white outline-none bg-transparent hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2"
            >
              <FaUserPlus /> SignUp
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg py-4 z-50 md:hidden">
          {/* Protected Mobile Links */}
          {user && (
            <>
              {/* User Profile */}
              <div className="px-4 py-2 border-b border-gray-200 flex flex-col items-center space-x-3 mb-5">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="User Profile"
                    width={40}
                    height={40}
                    className="rounded-full"
                    // onError={() => setProfileImage(null)}
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-black text-white text-lg font-bold rounded-full uppercase bg-gradient-to-r from-blue-700 to-[#B06AB3]">
                    {user.email.charAt(0)}
                  </div>
                )}
                <div className="flex flex-col mt-3">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                </div>
              </div>

              <button className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <FaPhone /> <Link href="/Ads">Phones</Link>
              </button>

              <button
                onClick={() => handleProtectedNavigation("/AdPost")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaShoppingCart /> Sell
              </button>

              <button
                onClick={() => handleProtectedNavigation("/my-ads")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaAd /> My Ads
              </button>

              <button
                onClick={() => handleProtectedNavigation("/FavouritesPage")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaHeart /> Favourites
              </button>

              <button
                onClick={() => handleProtectedNavigation("/profile")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaUser /> Profile
              </button>

              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                <FaEnvelope size={14} />{" "}
                <Link href="/ContactUs">contact us</Link>
              </button>
              <div className="border-t border-gray-200 my-2"></div>
            </>
          )}

          {user ? (
            <>
              {/* Admin Button */}
              {userRole === "admin" && userProvider !== "google" && (
                <button
                  type="button"
                  className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                >
                  <FaUserShield /> <Link href="/AdminPanel">Admin</Link>
                </button>
              )}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaSignInAlt /> Login
              </button>
              <button
                onClick={handleSignUp}
                className=" w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <FaUserPlus /> SignUp
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
