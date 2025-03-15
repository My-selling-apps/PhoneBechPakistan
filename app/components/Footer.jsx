import Link from "next/link";
import React from "react";
import { FaInstagram, FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-blueGray-200 pt-8 pb-6 mt-20 bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap text-left lg:text-left">
          <div className="w-full lg:w-6/12 px-4">
            <h4 className="text-3xl font-semibold text-blueGray-700">
              Let's keep in touch!
            </h4>
            <h5 className="text-lg mt-0 mb-2 text-blueGray-600">
              Find us on any of these platforms, we respond within 1-2 business
              days.
            </h5>
            <div className="mt-6 lg:mb-0 mb-6 flex">
              {/* Instagram Icon */}
              <a
                href="https://www.instagram.com/phonebechpk/profilecard/?igsh=MXRpZ2k1MDdpZzhobg=="
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-lightBlue-400 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all"
              >
                <FaInstagram className="text-lg" />
              </a>

              {/* Facebook Icon */}
              <a
                // href="https://www.facebook.com/your-facebook-link" // Replace with your Facebook link
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-lightBlue-600 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all"
              >
                <FaFacebookF className="text-lg" />
              </a>

              {/* YouTube Icon */}
              <a
                href="https://youtube.com/@phonebechpk?si=KwsOC9tLZPiMzv56"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-white shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all"
              >
                <FaYoutube className="text-lg" />
              </a>

              {/* TikTok Icon */}
              <a
                href="https://www.tiktok.com/@phonebechpk?_t=ZN-8uh6SHJ8jhe&_r=1"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-blueGray-800 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all"
              >
                <FaTiktok className="text-lg" />
              </a>
            </div>
          </div>
          <div className="w-full lg:w-6/12 px-4">
            <div className="flex flex-wrap items-top mb-6">
              <div className="w-full lg:w-4/12 px-4 ml-auto">
                <span className="block uppercase text-blueGray-500 text-sm font-semibold mb-2">
                  Useful Links
                </span>
                <ul className="list-unstyled">
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="/AboutUs"
                    >
                      About Us
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="#"
                    >
                      Promotions
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="#"
                    >
                      Featured Ads Pricing
                    </a>
                  </li>
                </ul>
              </div>
              <div className="w-full lg:w-4/12 px-4">
                <span className="block uppercase text-blueGray-500 text-sm font-semibold mb-2">
                  Other Resources
                </span>
                <ul className="list-unstyled">
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="/Terms&Conditions"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="/PrivacyPolicy"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <Link
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="/ContactUs"
                    >
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <hr className="my-6 border-blueGray-300" />
        <div className="flex flex-wrap items-center md:justify-between justify-center">
          <div className="w-full md:w-4/12 px-4 mx-auto text-center">
            <div className="text-sm text-blueGray-500 font-semibold py-1">
              Copyright © {new Date().getFullYear()}
              {" "}PhoneBechPk
              .
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}