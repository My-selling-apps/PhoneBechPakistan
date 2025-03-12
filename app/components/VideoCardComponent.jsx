import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const VideoCardComponent = () => {
  const [activeVideo, setActiveVideo] = useState(null);
  const modalVideoRef = useRef(null);

  const videos = [
    "https://gijarsxlfavlufecgjiw.supabase.co/storage/v1/object/public/ads-images/snap1.mp4?t=2025-01-25T21%3A28%3A33.335Z",
    "https://gijarsxlfavlufecgjiw.supabase.co/storage/v1/object/public/ads-images/snap2.mp4",
    "https://gijarsxlfavlufecgjiw.supabase.co/storage/v1/object/public/ads-images/snap3.mp4",
    "https://gijarsxlfavlufecgjiw.supabase.co/storage/v1/object/public/ads-images/snap3.mp4",
  ];

  const handleVideoClick = (video) => {
    setActiveVideo(video);
  };

  const closeVideo = () => {
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
    setActiveVideo(null);
  };

  return (
    <div className="relative min-h-[225px] top-[39px] md:top-[80px] bg-white">
      {/* Desktop Grid View */}
      <div className="hidden md:flex flex-wrap justify-center bg-white">
        {videos.map((video, index) => (
          <div
            key={index}
            className="m-8 w-[12rem] h-[379px] overflow-hidden rounded-lg shadow-md relative cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        ))}
      </div>

      {/* Mobile Scroll View */}
      <div className="flex md:hidden flex-nowrap overflow-x-scroll space-x-4 px-4 scrollbar-hide">
        {videos.map((video, index) => (
          <div
            key={index}
            className="flex-shrink-0 m-2 w-[117px] h-[200px] overflow-hidden rounded-lg shadow-md relative cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            <video
              src={video}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-fill"
            />
          </div>
        ))}
      </div>

      {/* Modal View */}
      {activeVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={closeVideo}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-black rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={modalVideoRef}
              src={activeVideo}
              autoPlay
              controls
              muted={false}
              className="max-w-full max-h-[80vh]"
              onLoadedData={() => {
                if (modalVideoRef.current) {
                  modalVideoRef.current.muted = false;
                  modalVideoRef.current.play().catch(error => {
                    console.log("Autoplay with sound failed:", error);
                  });
                }
              }}
            />
            <button
              onClick={closeVideo}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VideoCardComponent;