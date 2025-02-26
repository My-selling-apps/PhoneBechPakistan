import React from "react";

const BrandLogoSlider = () => {
    const brands = [
      { name: "Samsung", img: "/MobileBachIcons/samsung.svg" },
      { name: "Infinix", img: "/MobileBachIcons/infinix.svg" },
      { name: "OPPO", img: "/MobileBachIcons/oppo.svg" },
      { name: "Xiaomi", img: "/MobileBachIcons/xiaomi.svg" },
      { name: "Vivo", img: "/MobileBachIcons/vivo.svg" },
      { name: "Tecno", img: "/MobileBachIcons/tecno.svg" },
      { name: "Realme", img: "/MobileBachIcons/realme.svg" },
      { name: "Itel", img: "/MobileBachIcons/itel.svg" },
      { name: "Apple", img: "/MobileBachIcons/apple.svg" },
      { name: "Nokia", img: "/MobileBachIcons/nokia.svg" },


      { name: "Samsung", img: "/MobileBachIcons/samsung.svg" },
      { name: "Infinix", img: "/MobileBachIcons/infinix.svg" },
      { name: "OPPO", img: "/MobileBachIcons/oppo.svg" },
      { name: "Xiaomi", img: "/MobileBachIcons/xiaomi.svg" },
      { name: "Vivo", img: "/MobileBachIcons/vivo.svg" },
      { name: "Tecno", img: "/MobileBachIcons/tecno.svg" },
      { name: "Realme", img: "/MobileBachIcons/realme.svg" },
      { name: "Itel", img: "/MobileBachIcons/itel.svg" },
      { name: "Apple", img: "/MobileBachIcons/apple.svg" },
      { name: "Nokia", img: "/MobileBachIcons/nokia.svg" },


      { name: "Samsung", img: "/MobileBachIcons/samsung.svg" },
      { name: "Infinix", img: "/MobileBachIcons/infinix.svg" },
      { name: "OPPO", img: "/MobileBachIcons/oppo.svg" },
      { name: "Xiaomi", img: "/MobileBachIcons/xiaomi.svg" },
      { name: "Vivo", img: "/MobileBachIcons/vivo.svg" },
      { name: "Tecno", img: "/MobileBachIcons/tecno.svg" },
      { name: "Realme", img: "/MobileBachIcons/realme.svg" },
      { name: "Itel", img: "/MobileBachIcons/itel.svg" },
      { name: "Apple", img: "/MobileBachIcons/apple.svg" },
      { name: "Nokia", img: "/MobileBachIcons/nokia.svg" },
    ];
//the below is the code for the Brand logo slider which needed to be modify later 
    return (
        <div className="relative overflow-hidden  w-full mt-6 mb-5 top-[10px]" >
          <div className="flex items-center justify-around space-x-8 animate-scroll " >
            {/* Duplicate the images to create seamless loop */}
            {brands.concat(brands).map((brand, index) => (
              <div key={index} className="flex flex-col items-center justify-center" >
                <div className="w-10 h-10 md:h-[60px] md:w-[60px] rounded-full  bg-white flex items-center justify-center " >
                  <img
                    src={brand.img}
                    alt={brand.name}
                    className="w-full h-full object-contain rounded-full  "
                    
                  />
                </div>
                <p className="mt-2 text-center text-gray-700 text-sm">
                  {brand.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    export default BrandLogoSlider;



