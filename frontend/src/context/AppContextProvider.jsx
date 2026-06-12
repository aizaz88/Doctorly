import React, { useEffect } from "react";
import { AppContext } from "./AppContext.jsx";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [doctors, setDoctors] = useState([]);
  const [token, setToken] = useState(
    localStorage.getItem("uToken") ? localStorage.getItem("uToken") : "",
  );
  const [user, setUser] = useState(null);

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/list");
      if (data.success) {
        setDoctors(data.doctors);
      } else {
        toast.error(data.message || "Failed to load doctors");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred");
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/register", {
        name,
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("uToken", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.message || "Registration failed");
      return false;
    }
  };

  const loginUser = async (email, password) => {
    try {
      const { data } = await axios.post(backendUrl + "/api/user/login", {
        email,
        password,
      });

      if (data.success) {
        localStorage.setItem("uToken", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success(data.message);
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
      return false;
    }
  };

  const getUserProfile = async () => {
    try {
      if (!token) return;
      const { data } = await axios.get(backendUrl + "/api/user/me", {
        headers: { uToken: token },
      });
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      // silently ignore
    }
  };

  const updateUserProfile = async (profile) => {
    try {
      if (!token) throw new Error("Not authenticated");
      const { data } = await axios.put(
        backendUrl + "/api/user/update-profile",
        profile,
        {
          headers: { uToken: token },
        },
      );
      if (data.success) {
        setUser(data.user);
        toast.success(data.message || "Profile updated");
        return true;
      } else {
        toast.error(data.message || "Update failed");
        return false;
      }
    } catch (error) {
      toast.error(error.message || "Update failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("uToken");
    setToken("");
    setUser(null);
    toast.success("Logged out successfully");
  };

  useEffect(() => {
    getDoctorsData();
    if (token) getUserProfile();
  }, []);

  const value = {
    doctors,
    currencySymbol: "$",
    backendUrl,
    getDoctorsData,
    token,
    setToken,
    user,
    setUser,
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
