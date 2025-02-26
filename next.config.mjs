/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "gijarsxlfavlufecgjiw.supabase.co", // Corrected hostname
        pathname: "/storage/v1/object/public/profiles_images/**",
      },
    ],
    domains: ["lh3.googleusercontent.com", "gijarsxlfavlufecgjiw.supabase.co"], // Corrected hostname
  },
};

export default nextConfig;