// "use client";
// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { supabase } from "../supabase"; // Import your Supabase client

// const AuthGuard = ({ children }) => {
//   const router = useRouter();

//   useEffect(() => {
//     const checkAuth = async () => {
//       const { data: session } = await supabase.auth.getSession();
//       if (!session?.session?.user) {
//         router.push("/login"); // Redirect unauthenticated users to login
//       }
//     };
//     checkAuth();
//   }, [router]);

//   return <>{children}</>;
// };

// export default AuthGuard;
