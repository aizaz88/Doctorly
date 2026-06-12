import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Login from "./pages/Login";
import React, { useContext } from "react";
import { AdminContext } from "./context/AdminContext";
import { DoctorContext } from "./context/DoctorContext";
import NavBar from "./components/NavBar";
import SideBar from "./components/SideBar";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctors from "./pages/Admin/AddDoctors";
import DoctorsList from "./pages/Admin/DoctorsList";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import DoctorAppointment from "./pages/Doctor/DoctorAppointment";

const App = () => {
  const { token } = useContext(AdminContext) || {};
  const { dToken } = useContext(DoctorContext) || {};

  if (token) {
    return (
      <div className="bg-#F8F9FD">
        <ToastContainer />
        <NavBar />
        <div className="flex items-start">
          <SideBar />
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/admin-dashboard" replace />}
            />
            <Route path="/admin-dashboard" element={<Dashboard />} />
            <Route path="/all-appointments" element={<AllAppointments />} />
            <Route path="/add-doctor" element={<AddDoctors />} />
            <Route path="/doctor-list" element={<DoctorsList />} />
            <Route
              path="*"
              element={<Navigate to="/admin-dashboard" replace />}
            />
          </Routes>
        </div>
      </div>
    );
  }

  if (dToken) {
    return (
      <div className="bg-#F8F9FD">
        <ToastContainer />
        <NavBar />
        <div className="flex items-start">
          <SideBar />
          <div className="min-h-screen">
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/doctor-dashboard" replace />}
              />
              <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor-profile" element={<DoctorProfile />} />
              <Route
                path="/doctor-appointments"
                element={<DoctorAppointment />}
              />
            </Routes>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Login />
      <ToastContainer />
    </>
  );
};

export default App;
