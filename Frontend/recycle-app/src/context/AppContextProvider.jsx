import { useState } from "react";
import { AppContent } from "./AppContext";
import axios from "axios";

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null); // ✅ start with null

  // ✅ Check authentication status
  const getAuthState = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(${backendUrl}/api/auth/is-auth);

      if (data.success) {
        setIsLoggedin(true);
        await getUserData(); // also fetch user data
      } else {
        setIsLoggedin(false);
        setUserData(null);
      }
    } catch (error) {
      setIsLoggedin(false);
      setUserData(null);
      console.warn("Auth check failed:", error.response?.data?.message || error.message);
    }
  };

  // ✅ Get user data (including role) and return it
  const getUserData = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(${backendUrl}/api/user/data);

      if (data.success) {
        setUserData(data.userData);
        return data.userData; // ✅ return so Login/Signup can use it
      } else {
        console.warn("Failed to fetch user data:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const value = {
    backendUrl,
    isLoggedin,
    setIsLoggedin,
    userData,
    setUserData,
    getUserData,
    getAuthState,
  };

  return <AppContent.Provider value={value}>{children}</AppContent.Provider>;
};