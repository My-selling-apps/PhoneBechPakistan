"use client"
import { useState, useEffect } from 'react';

export default function ImageSlider({buttonTxt}) {
  const images = [
    '/s1.jpg',
    '/s2.jpg',
    '/s3.jpg',
    '/s4.jpg',
   
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <div className="relative w-full h-[164px] md:h-[500px] top-10 overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={image}
                alt={`Slider image ${index + 1}`}
                className="w-full ms:h-[300px] md:h-[700px] md:object-fill object-fit"
              />
            </div>
          ))}
        </div>

        {/* Left Arrow - Fixed positioning */}
        <button
          onClick={() => setCurrentIndex((currentIndex - 1 + images.length) % images.length)}
          className="absolute hidden md:block top-[50%] -translate-y-1/2 left-4 bg-white text-black rounded-md p-2 z-10 transform"
        >
          &lt;
        </button>

        {/* Right Arrow - Fixed positioning */}
        <button
          onClick={() => setCurrentIndex((currentIndex + 1) % images.length)}
          className="absolute hidden md:block top-[50%] -translate-y-1/2 right-4 bg-white text-black rounded-md p-2 z-10 transform"
        >
          &gt;
        </button>

        {/* Indicators */}
        <div className="absolute hidden md:bottom-0 left-1/2 transform -translate-x-1/2  space-x-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-gray-500'}`}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}