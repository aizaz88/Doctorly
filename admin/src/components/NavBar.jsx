import React, { useContext } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import { assets } from "../assets/assets_admin/assets";
import { useNavigate } from "react-router-dom";
const NavBar = () => {
  const { token, setToken } = useContext(AdminContext) || {};
  const { dToken, setDToken } = useContext(DoctorContext) || {};
  const navigate = useNavigate();

  const isAdmin = Boolean(token);
  const isDoctor = Boolean(dToken);
  const roleLabel = isAdmin ? "Admin" : isDoctor ? "Doctor" : "Guest";

  const logout = () => {
    navigate("/");
    if (isAdmin) {
      setToken("");
      localStorage.removeItem("aToken");
    }
    if (isDoctor) {
      setDToken("");
      localStorage.removeItem("dToken");
    }
  };

  return (
    <div className="flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white">
      <div className="flex items-center gap-2 text-xs">
        <div className="items-center">
          <img
            className="w-36 sm:w-40 cursor-pointer"
            src={assets.logo}
            alt=""
            onClick={() =>
              navigate(
                isAdmin
                  ? "/admin-dashboard"
                  : isDoctor
                    ? "/doctor-dashboard"
                    : "/",
              )
            }
          />
          <p className="text-blue-900 pl-11">Dashboard Panel</p>
        </div>
        <p className="border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600 ">
          {roleLabel}
        </p>
      </div>
      <button
        onClick={logout}
        className="bg-blue-900 text-white text-sm px-10 py-2 rounded-full"
      >
        Logout
      </button>
    </div>
  );
};

export default NavBar;
