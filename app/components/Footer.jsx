import Link from "next/link";
import React from "react";
import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok } from "react-icons/fa";

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
              <button className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-lightBlue-400 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all">
                <FaInstagram className="text-lg" />
              </button>

              {/* Facebook Icon */}
              <button className="bg-white  bg-gradient-to-r from-blue-700 to-[#B06AB3] text-lightBlue-600 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all">
                <FaFacebookF className="text-lg" />
              </button>

              {/* Twitter Icon */}
              <button className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-pink-400 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all">
                <FaTwitter className="text-lg" />
              </button>

              {/* TikTok Icon */}
              <button className="bg-white bg-gradient-to-r from-blue-700 to-[#B06AB3] text-blueGray-800 shadow-lg font-normal h-10 w-10 flex items-center justify-center rounded-full outline-none focus:outline-none mr-2 hover:bg-gray-100 transition-all">
                <FaTiktok className="text-lg" />
              </button>
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
                      href="#"
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
                      href="#"
                    >
                      Terms &amp; Conditions
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blueGray-600 hover:text-blueGray-800 font-semibold block pb-2 text-sm"
                      href="#"
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
              <a
                href="https://www.creative-tim.com/product/notus-js"
                className="text-blueGray-500 hover:text-gray-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Phone
              </a>{" "}
              <a
                href="https://www.creative-tim.com?ref=njs-profile"
                className="text-blueGray-500 hover:text-blueGray-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {" "}
                Bach
              </a>
              .
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
