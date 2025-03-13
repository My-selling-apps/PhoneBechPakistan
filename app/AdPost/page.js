"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import { supabase } from "../supabase";
import { v4 as uuidv4 } from "uuid";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const locationSectors = {
  "Islamabad Capital Territory, Pakistan": [
    "Sector F-5",
    "Sector G-6",
    "Sector H-8",
    "Sector I-9",
    "Sector D-12",
    "Other",
  ],
  "Azad Kashmir, Pakistan": ["Muzaffarabad", "Mirpur", "Rawalakot", "Other"],
  "Balochistan, Pakistan": ["Quetta", "Gwadar", "Khuzdar", "Other"],
  "Khyber Pakhtunkhwa, Pakistan": ["Peshawar", "Abbottabad", "Mardan", "Other"],
  "Northern Areas, Pakistan": ["Gilgit", "Skardu", "Hunza", "Other"],
  "Punjab, Pakistan": ["Lahore", "Faisalabad", "Rawalpindi", "Other"],
  "Sindh, Pakistan": ["Karachi", "Hyderabad", "Sukkur", "Other"],
};

export default function AdPost() {
  const [images, setImages] = useState([]);
  const [brand, setBrand] = useState("");
  const [location, setLocation] = useState("");
  const [sectors, setSectors] = useState([]);
  const [selectedSector, setSelectedSector] = useState("");
  const [area, setArea] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isDeliverable, setIsDeliverable] = useState(false);
  const [sold, setSold] = useState(null);
  const [loading, setLoading] = useState(false);
  const [condition, setCondition] = useState("");

  const router = useRouter();

  const handleImageUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files).slice(0, 4);
    setImages(uploadedFiles);
  };

  const handleLocationChange = (e) => {
    const selectedLocation = e.target.value;
    setLocation(selectedLocation);
    setSectors(locationSectors[selectedLocation] || []);
    setSelectedSector("");
    setArea("");
  };

  const handlePostAd = async () => {
    try {
      setLoading(true);
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.session?.user) throw new Error("User not logged in");

      const user_id = session.session.user.id;
      const ad_id = Date.now();

      const predictImage = async (image) => {
        const formData = new FormData();
        formData.append("image", image);
        const response = await fetch("https://api.phonebechpk.com/api/predict/", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Prediction API request failed");
        return (await response.json()).results[0];
      };

      const processedImages = await Promise.all(
        images.map(async (image) => {
          const prediction = await predictImage(image);
          const fileName = `${Date.now()}-${image.name}`;
          const { error } = await supabase.storage.from("ads-images").upload(fileName, image);
          if (error) throw error;
          const { data: publicUrlData } = supabase.storage.from("ads-images").getPublicUrl(fileName);
          return { url: publicUrlData.publicUrl, prediction };
        })
      );

      const validImages = processedImages.filter(
        (img) =>
          (img.prediction.predictedLabel === "Smartphone" || img.prediction.predictedLabel === "Laptop") &&
          parseFloat(img.prediction.confidence) > 50
      );

      const invalidImages = processedImages.filter(
        (img) =>
          (img.prediction.predictedLabel !== "Smartphone" && img.prediction.predictedLabel !== "Laptop") ||
          parseFloat(img.prediction.confidence) <= 50
      );

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
          sold,
          sector: selectedSector,
          area,
        });
        if (insertError) throw insertError;
        toast("Ad posted successfully!");
      }

      if (invalidImages.length > 0) {
        const { error: rejectedError } = await supabase.from("rejected_user_ads").insert({
          ad_id,
          user_id,
          brand,
          location,
          ad_title: adTitle,
          description,
          price,
          name,
          phone,
          area,
          images: invalidImages.map((img) => img.url),
          condition,
          rejection_reason: invalidImages
            .map((img) => `${img.prediction.predictedLabel} (${img.prediction.confidence})`)
            .join(", "),
          sector: selectedSector,
          area,
        });
        if (rejectedError) throw rejectedError;
        if (validImages.length === 0) toast("Ad could not be posted. Images do not meet smartphone criteria.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast(`Error: ${error.message}`);
    } finally {
      setLoading(false);
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
    setSectors([]);
    setSelectedSector("");
    setArea("");
    setAdTitle("");
    setDescription("");
    setPrice("");
    setName("");
    setPhone("");
    setIsDeliverable(false);
    setCondition("");
    setSold(null);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-1 mt-5">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Post Your Ad</h1>
        <form className="space-y-8 bg-white shadow-lg rounded-lg p-8 border border-gray-200 max-w-5xl mx-auto">
          {/* Upload Images */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Upload Images (Max 4)</label>
            <div className="relative flex items-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
              />
            </div>
            <div className="flex gap-2 mt-4">
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

          {/* Brand */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Brand</label>
            <div className="relative flex items-center">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
              >
                <option value="">Select Brand</option>
                <option value="Apple iPhone">Apple iPhone</option>
                <option value="Motorola">Motorola</option>
                <option value="Xiaomi">Xiaomi</option>
                <option value="Google">Google</option>
                <option value="HTC">HTC</option>
                <option value="BlackBerry">BlackBerry</option>
                <option value="itel Mobile">itel Mobile</option>
                <option value="Acer">Acer</option>
                <option value="Samsung Mobile">Samsung Mobile</option>
                <option value="Nokia">Nokia</option>
                <option value="OPPO">OPPO</option>
                <option value="Realme">Realme</option>
                <option value="OnePlus">OnePlus</option>
                <option value="LG">LG</option>
                <option value="Sony">Sony</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Huawei">Huawei</option>
                <option value="Honor">Honor</option>
                <option value="Infinix Mobile">Infinix Mobile</option>
                <option value="BLU Products">BLU Products</option>
                <option value="Tecno Spark">Tecno Spark</option>
                <option value="Karbonn Mobiles">Karbonn Mobiles</option>
              </select>
            </div>
          </div>

          {/* Ad Title */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Ad Title*</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={adTitle}
                onChange={(e) => setAdTitle(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                placeholder="Enter ad title"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Description*</label>
            <div className="relative flex items-center">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                placeholder="Describe the item"
                rows="3"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Location*</label>
            <div className="relative flex items-center">
              <select
                value={location}
                onChange={handleLocationChange}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
              >
                <option value="">Select location</option>
                <option value="Azad Kashmir, Pakistan">Azad Kashmir, Pakistan</option>
                <option value="Balochistan, Pakistan">Balochistan, Pakistan</option>
                <option value="Islamabad Capital Territory, Pakistan">Islamabad Capital Territory, Pakistan</option>
                <option value="Khyber Pakhtunkhwa, Pakistan">Khyber Pakhtunkhwa, Pakistan</option>
                <option value="Northern Areas, Pakistan">Northern Areas, Pakistan</option>
                <option value="Punjab, Pakistan">Punjab, Pakistan</option>
                <option value="Sindh, Pakistan">Sindh, Pakistan</option>
              </select>
            </div>
          </div>

          {/* Sector */}
          {sectors.length > 0 && (
            <div>
              <label className="text-gray-800 text-xs block mb-2">City*</label>
              <div className="relative flex items-center">
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                >
                  <option value="">Select City</option>
                  {sectors.map((sector, index) => (
                    <option key={index} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Area */}
          {selectedSector && (
            <div>
              <label className="text-gray-800 text-xs block mb-2">Area (Optional)</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                  placeholder="Enter area"
                />
              </div>
            </div>
          )}

          {/* Price */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Price*</label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                placeholder="Enter price"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Name*</label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                placeholder="Enter your name"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Mobile Phone Number*</label>
            <div className="relative flex items-center">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-sm border-b border-gray-300 focus:border-gray-800 pl-2 pr-8 py-3 outline-none"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="text-gray-800 text-xs block mb-2">Condition</label>
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
            <label className="text-gray-800 text-xs block mb-2">Is Deliverable?</label>
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
            disabled={loading}
          >
            {loading ? <Loader /> : "Post Ad"}
          </button>
        </form>
      </div>
      <div className="relative top-32">
        <Footer />
      </div>
      <ToastContainer />
    </>
  );
}