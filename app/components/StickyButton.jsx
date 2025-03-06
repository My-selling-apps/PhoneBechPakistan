"use client";

import { useEffect, useState } from "react";

export default function StickyButton({ buttonText = "Sign up", onClick }) {
  const [isRotating, setIsRotating] = useState(false);

  // Trigger rotation every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsRotating(true); // Start rotation
      setTimeout(() => {
        setIsRotating(false); // Stop rotation after 1 second
      }, 1000); // Rotation duration
    }, 6000); // 3-second interval

    return () => clearInterval(interval); // Cleanup interval
  }, []);

  return (
    <div
      className="fixed bottom-[5px] left-1/2 transform -translate-x-1/2 z-50"
      style={{ marginBottom: "40px" }}
    >
      <div className="relative inline-flex items-center justify-center gap-4 group">
        <div
          className="absolute inset-0 duration-1000 opacity-60 transition-all bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-400 rounded-xl blur-xl filter group-hover:opacity-100 group-hover:duration-200"
          style={{ borderRadius: "0px 40px 0px 40px" }}
        ></div>
        <button
          onClick={onClick}
          className="bg-gradient-to-r from-blue-700 to-[#B06AB3] group relative inline-flex items-center justify-center text-base rounded-xl px-8 py-3 font-semibold text-white transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 hover:shadow-gray-600/30 border-2 "
          title="payment"
            style={{ borderRadius: "0px 40px 0px 40px" }}
        >
          <span
            className={`inline-block transition-transform duration-1000 ease-in-out ${
              isRotating ? "rotate-360" : ""
            }`}
          >
            {buttonText}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 10 10"
            height="10"
            width="10"
            fill="none"
            className="mt-0.5 ml-2 -mr-1 stroke-white stroke-2"
          >
            <path
              d="M0 5h7"
              className="transition opacity-0 group-hover:opacity-100"
            ></path>
            <path
              d="M1 1l4 4-4 4"
              className="transition group-hover:translate-x-[3px]"
            ></path>
          </svg>
        </button>
      </div>

      {/* Add CSS for rotation animation */}
      {/* <style jsx>{`
        .rotate-360 {
          transform: rotate(360deg);
        }
      `}</style> */}
    </div>
  );
}