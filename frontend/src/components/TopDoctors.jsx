import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import DoctorCard from "./DoctorCard";
import { AppContext } from "../context/AppContext";
import { useEffect } from "react";

const TopDoctors = () => {
  const navigate = useNavigate();
  const { doctors, getDoctorsData } = useContext(AppContext);

  useEffect(() => {
    getDoctorsData();
  }, []);
  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="font-medium text-3xl">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      {/* 👇 5 cards per row */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-5 px-3 sm:px-0">
        {doctors.slice(0, 10).map((doctor) => (
          <DoctorCard
            key={doctor._id}
            doctor={doctor}
            onClick={() => {
              navigate(`/appointment/${doctor._id}`);
              window.scrollTo(0, 0);
            }}
          />
        ))}
      </div>
      <button
        className="bg-blue-50  text-gray-600 px-12 py-3 rounded-full mt-5"
        onClick={() => navigate("/doctors")}
      >
        more
      </button>
    </div>
  );
};

export default TopDoctors;
