"use client";

import { useState, useEffect } from 'react';
import { supabase } from "../supabase";
import { Camera } from "lucide-react";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    date_of_birth: {
      day: '',
      month: '',
      year: ''
    },
    phone_number: '',
    gender: '',
    address: '',
    profile_image: null
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchUserAndProfile();
  }, []);

  const fetchUserAndProfile = async () => {
    try {
      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        // Fetch profile data
        const { data: profileData, error } = await supabase
          .from('users_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .single();

        if (profileData) {
          // Parse date of birth if exists
          const dob = profileData.date_of_birth ? new Date(profileData.date_of_birth) : null;
          setProfile({
            ...profileData,
            date_of_birth: dob ? {
              day: dob.getDate().toString().padStart(2, '0'),
              month: (dob.getMonth() + 1).toString().padStart(2, '0'),
              year: dob.getFullYear().toString()
            } : { day: '', month: '', year: '' }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profile_image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      let imageUrl = profile.profile_image;

      if (imageFile) {
        setUploading(true);
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload image to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('profiles_images')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles_images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const dateOfBirth = new Date(
        `${profile.date_of_birth.year}-${profile.date_of_birth.month}-${profile.date_of_birth.day}`
      ).toISOString();

      const { error } = await supabase
        .from('users_profiles')
        .upsert({
          user_id: user.id,
          full_name: profile.full_name,
          date_of_birth: dateOfBirth,
          phone_number: profile.phone_number,
          gender: profile.gender,
          address: profile.address,
          profile_image: imageUrl
        });

      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8 mt-24">
        <div className="flex flex-col items-center">
          {/* Profile Image */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {profile.profile_image ? (
                <img
                  src={profile.profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Camera size={40} className="text-gray-400" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
              <Camera size={20} className="text-white" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Profile Form */}
          <div className="w-full space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <div className="grid grid-cols-3 gap-4 mt-1">
                <select
                  value={profile.date_of_birth.day}
                  onChange={(e) => setProfile({
                    ...profile,
                    date_of_birth: { ...profile.date_of_birth, day: e.target.value }
                  })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">DD</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day.toString().padStart(2, '0')}>
                      {day.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={profile.date_of_birth.month}
                  onChange={(e) => setProfile({
                    ...profile,
                    date_of_birth: { ...profile.date_of_birth, month: e.target.value }
                  })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={profile.date_of_birth.year}
                  onChange={(e) => setProfile({
                    ...profile,
                    date_of_birth: { ...profile.date_of_birth, year: e.target.value }
                  })}
                  className="block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">YYYY</option>
                  {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={profile.phone_number || ''}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            {/* Email (Disabled) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Gender</label>
              <select
                value={profile.gender || ''}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={profile.address || ''}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>

            {/* Save Button */}
            <div>
              <button
                onClick={handleSave}
                disabled={loading || uploading}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;