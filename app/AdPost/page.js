"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid"; // Import the UUID library
import Footer from "../components/Footer";

export default function AdPost() {
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [sold, setSold] = useState(null); // Optional, can be updated later
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState(""); // Add this with other state variables

  const router = useRouter();

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).slice(0, 4);
    setImages(uploadedFiles);
  };

  const handlePostAd = async () => {
    try {
      setLoading(true); // Start loader
      console.log("Starting ad posting process...");

      // User session retrieval
      const { data: session, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session Error:", sessionError);
        throw sessionError;
      }

      if (!session?.session?.user) {
        console.error("No user session found");
        throw new Error("User not logged in");
      }

      const user_id = session.session.user.id;
      const ad_id = Date.now();
      console.log(`Generated Ad ID: ${ad_id}, User ID: ${user_id}`);

      // Prediction API function with enhanced logging
      const predictImage = async (image) => {
        console.log(`Sending image to prediction API: ${image.name}`);

        const formData = new FormData();
        formData.append("image", image);

        try {
          const response = await fetch("http://51.20.4.136:8000/api/predict/", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            console.error(
              `Prediction API request failed. Status: ${response.status}`
            );
            throw new Error("Prediction API request failed");
          }

          const data = await response.json();
          console.log(
            "Prediction API Response:",
            JSON.stringify(data, null, 2)
          );

          return data.results[0];
        } catch (error) {
          console.error("API Prediction Error:", error);
          throw error;
        }
      };

      // Process images with prediction and logging
      const processedImages = await Promise.all(
        images.map(async (image) => {
          try {
            // Predict image
            const prediction = await predictImage(image);
            console.log(`Prediction for ${image.name}: 
            Label: ${prediction.predictedLabel}, 
            Confidence: ${prediction.confidence}`);

            // Upload image to Supabase storage
            const fileName = `${Date.now()}-${image.name}`;
            const { data, error } = await supabase.storage
              .from("ads-images")
              .upload(fileName, image);

            if (error) {
              console.error(
                `Supabase Storage Upload Error for ${fileName}:`,
                error
              );
              throw error;
            }

            // Generate public URL
            const { data: publicUrlData } = supabase.storage
              .from("ads-images")
              .getPublicUrl(fileName);
            console.log(
              `Image uploaded. Public URL: ${publicUrlData.publicUrl}`
            );

            return {
              url: publicUrlData.publicUrl,
              prediction: prediction,
            };
          } catch (error) {
            console.error(`Image processing error for ${image.name}:`, error);
            throw error;
          }
        })
      );

      // Detailed logging for image classification
      const validImages = processedImages.filter(
        (img) =>
          img.prediction.predictedLabel === "Smartphone" &&
          parseFloat(img.prediction.confidence) > 60
      );

      const invalidImages = processedImages.filter(
        (img) =>
          img.prediction.predictedLabel !== "Smartphone" ||
          parseFloat(img.prediction.confidence) <= 60
      );

      console.log(`Valid Images Count: ${validImages.length}`);
      console.log(`Invalid Images Count: ${invalidImages.length}`);

      // Insert valid images
      if (validImages.length > 0) {
        const { error: insertError } = await supabase.from("user_ads").insert({
          ad_id,
          user_id,
          brand,
          location,
          ad_title: adTitle,
          description,
          price,
          name,
          phone,
          images: validImages.map((img) => img.url),
          is_deliverable: isDeliverable,
          condition,
          sold: sold,
        });

        if (insertError) {
          console.error("Insert into user_ads Error:", insertError);
          throw insertError;
        }

        console.log("Ad successfully posted in user_ads");
        alert("Ad posted successfully!");
        // resetForm();
      }

      // Insert rejected images
      if (invalidImages.length > 0) {
        const { error: rejectedError } = await supabase
          .from("rejected_user_ads")
          .insert({
            ad_id,
            user_id,
            brand,
            location,
            ad_title: adTitle,
            description,
            price,
            name,
            phone,
            images: invalidImages.map((img) => img.url),
            condition,
            rejection_reason: invalidImages
              .map(
                (img) =>
                  `${img.prediction.predictedLabel} (${img.prediction.confidence})`
              )
              .join(", "),
          });

        if (rejectedError) {
          console.error("Insert into rejected_user_ads Error:", rejectedError);
          throw rejectedError;
        }

        console.log("Rejected images inserted into rejected_user_ads");

        if (validImages.length === 0) {
          console.warn("No valid smartphone images found");
          alert(
            "Ad could not be posted. Images do not meet smartphone criteria."
          );
        }
      }

      console.log("Ad posting process completed successfully");
    } catch (error) {
      console.error("Comprehensive Error in handlePostAd:", error);
      console.error("Error Details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      alert(`Error: ${error.message}`);
    }
  };

  const handleDropdownSelect = (selectedBrand) => {
    setBrand(selectedBrand);
    const menu = document.getElementById("dropdownMenu");
    menu.classList.add("hidden");
  };

  const resetForm = () => {
    setImages([]);
    setBrand("");
    setLocation("");
    setAdTitle("");
    setDescription("");
    setPrice("");
    setName("");
    setPhone("");
    setIsDeliverable(false);
    setCondition(""); // For the new condition field
    setSold(null);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Post Your Ad
        </h1>
        <form className="space-y-8 bg-white shadow-lg rounded-lg p-8 border border-gray-200 max-w-5xl mx-auto">
          {/* Upload Images */}
          <div>
            <div className="font-[sans-serif]">
              <div className="bg-gradient-to-r from-blue-700 via-blue-500 to-blue-700 text-white min-h-[220px] flex items-center justify-center text-center">
                <h4 className="text-3xl font-semibold -mt-8">
                  Upload file here
                </h4>
              </div>
              <div className="max-w-lg mx-auto relative bg-white border-2 border-gray-300 border-dashed rounded-md -top-24">
                <div
                  className="p-4 min-h-[300px] flex flex-col items-center justify-center text-center cursor-pointer"
                  onDrop={(event) => {
                    event.preventDefault();
                    const droppedFiles = Array.from(
                      event.dataTransfer.files
                    ).slice(0, 4);
                    handleImageUpload({ target: { files: droppedFiles } });
                  }}
                  onDragOver={(event) => event.preventDefault()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 mb-4 fill-gray-600 inline-block"
                    viewBox="0 0 32 32"
                  >
                    <path
                      d="M23.75 11.044a7.99 7.99 0 0 0-15.5-.009A8 8 0 0 0 9 27h3a1 1 0 0 0 0-2H9a6 6 0 0 1-.035-12 1.038 1.038 0 0 0 1.1-.854 5.991 5.991 0 0 1 11.862 0A1.08 1.08 0 0 0 23 13a6 6 0 0 1 0 12h-3a1 1 0 0 0 0 2h3a8 8 0 0 0 .75-15.956z"
                      data-original="#000000"
                    />
                    <path
                      d="M20.293 19.707a1 1 0 0 0 1.414-1.414l-5-5a1 1 0 0 0-1.414 0l-5 5a1 1 0 0 0 1.414 1.414L15 16.414V29a1 1 0 0 0 2 0V16.414z"
                      data-original="#000000"
                    />
                  </svg>
                  <h4 className="text-base font-semibold text-gray-600">
                    Drag & Drop file here <br /> or
                  </h4>
                  <label
                    htmlFor="chooseFile"
                    className="text-blue-600 text-base font-semibold cursor-pointer underline"
                  >
                    Choose file
                  </label>
                  <input
                    type="file"
                    id="chooseFile"
                    className="hidden"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <div className="flex gap-2 mt-4 px-4 pb-4">
                  {images.map((image, index) => (
                    <img
                      key={index}
                      src={URL.createObjectURL(image)}
                      alt={`Uploaded ${index}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Brand */}
          <div>
            <label className="block mb-2 font-semibold">Brand</label>
            <div className="relative rounded-lg font-[sans-serif]">
              <button
                type="button"
                id="dropdownToggle"
                className="px-5 py-2.5 bg-gray-50 text-[#333] text-sm font-semibold border-b-2 border-[#333] outline-none w-full text-left flex justify-between items-center"
                onClick={() => {
                  const menu = document.getElementById("dropdownMenu");
                  menu.classList.toggle("hidden");
                }}
              >
                {brand || "Select Brand"}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3 fill-[#333] ml-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.99997 18.1669a2.38 2.38 0 0 1-1.68266-.69733l-9.52-9.52a2.38 2.38 0 1 1 3.36532-3.36532l7.83734 7.83734 7.83734-7.83734a2.38 2.38 0 1 1 3.36532 3.36532l-9.52 9.52a2.38 2.38 0 0 1-1.68266.69734z"
                    clipRule="evenodd"
                    data-original="#000000"
                  />
                </svg>
              </button>
              <ul
                id="dropdownMenu"
                className="absolute hidden shadow-xl bg-white py-2 z-[1000] min-w-full w-max rounded max-h-96 overflow-auto"
              >
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Apple iPhone")}
                >
                  Apple iPhone
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Motorola")}
                >
                  Motorola
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Xiaomi")}
                >
                  Xiaomi
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Google")}
                >
                  Google
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("HTC")}
                >
                  HTC
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("BlackBerry")}
                >
                  BlackBerry
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("itel Mobile")}
                >
                  itel Mobile
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Acer")}
                >
                  Acer
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Samsung Mobile")}
                >
                  Samsung Mobile
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Nokia")}
                >
                  Nokia
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("OPPO")}
                >
                  OPPO
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Karbonn Mobiles")}
                >
                  Realme
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("OnePlus")}
                >
                  OnePlus
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("LG")}
                >
                  LG
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Sony")}
                >
                  Sony
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Lenovo")}
                >
                  Lenovo
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Huawei")}
                >
                  Huawei
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Honor")}
                >
                  Honor
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Infinix Mobile")}
                >
                  Infinix Mobile
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("BLU Products")}
                >
                  BLU Products
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Tecno Spark")}
                >
                  Tecno Spark
                </li>
                <li
                  className="py-2.5 px-5 hover:bg-gray-50 text-[#333] text-sm cursor-pointer"
                  onClick={() => handleDropdownSelect("Karbonn Mobiles")}
                >
                  Karbonn Mobiles
                </li>
              </ul>
            </div>
          </div>

          {/* Ad Title */}
          <div>
            <label className="block mb-2 font-semibold">Ad Title*</label>
            <input
              type="text"
              value={adTitle}
              onChange={(e) => setAdTitle(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter ad title"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-semibold">Description*</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the item"
              rows="5"
            ></textarea>
          </div>

          {/* Location */}
          <div>
            <label className="block mb-2 font-semibold">Location*</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>
                Select location
              </option>
              <option value="Azad Kashmir, Pakistan">
                Azad Kashmir, Pakistan
              </option>
              <option value="Balochistan, Pakistan">
                Balochistan, Pakistan
              </option>
              <option value="Islamabad Capital Territory, Pakistan">
                Islamabad Capital Territory, Pakistan
              </option>
              <option value="Khyber Pakhtunkhwa, Pakistan">
                Khyber Pakhtunkhwa, Pakistan
              </option>
              <option value="Northern Areas, Pakistan">
                Northern Areas, Pakistan
              </option>
              <option value="Punjab, Pakistan">Punjab, Pakistan</option>
              <option value="Sindh, Pakistan">Sindh, Pakistan</option>
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block mb-2 font-semibold">Price*</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter price"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block mb-2 font-semibold">Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block mb-2 font-semibold">
              Mobile Phone Number*
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="block w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter phone number"
            />
          </div>

          {/* condition section  */}

          {/* Condition */}
          <div>
            <label className="block mb-2 font-semibold">Condition</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  value="new"
                  checked={condition === "new"}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mr-2"
                />
                New
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="condition"
                  value="used"
                  checked={condition === "used"}
                  onChange={(e) => setCondition(e.target.value)}
                  className="mr-2"
                />
                Used
              </label>
            </div>
          </div>

          {/* Is Deliverable Checkbox */}
          <div>
            <label className="block mb-2 font-semibold">Is Deliverable?</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliverable"
                  value="yes"
                  checked={isDeliverable === true}
                  onChange={() => setIsDeliverable(true)}
                  className="mr-2"
                />
                Yes
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="deliverable"
                  value="no"
                  checked={isDeliverable === false}
                  onChange={() => setIsDeliverable(false)}
                  className="mr-2"
                />
                No
              </label>
            </div>
          </div>

          {/* Submit Button */}

          <button
            type="button"
            onClick={handlePostAd}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition text-lg font-semibold"
          >
            Post Ad
          </button>
        </form>
      </div>
      <div className="relative top-32">
        <Footer />
      </div>
    </>
  );
}
