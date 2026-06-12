import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import DoctorCard from "../components/DoctorCard";

const Doctors = () => {
  const { speciality } = useParams();
  const { doctors, getDoctorsData } = useContext(AppContext);
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (speciality) {
      setFilterDoc(doctors.filter((doc) => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, speciality]);

  useEffect(() => {
    getDoctorsData();
  }, []);

  return (
    <div className="px-4 sm:px-10 my-10">
      <p className="text-gray-600 mb-6">
        Browse through the doctors specialist.
      </p>

      {/* Specialities */}
      <ul className="flex gap-4 flex-wrap mb-8 text-sm">
        {[
          "General physician",
          "Gynecologist",
          "Dermatologist",
          "Pediatricians",
          "Neurologist",
          "Gastroenterologist",
        ].map((spec) => (
          <li
            key={spec}
            onClick={() => navigate(`/doctors/${spec}`)}
            className={`cursor-pointer px-4 py-2 rounded ${
              speciality === spec
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {spec}
          </li>
        ))}
      </ul>

      {/* Doctors grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {filterDoc.map((item) => (
          <DoctorCard
            key={item._id}
            doctor={item}
            onClick={() => navigate(`/appointment/${item._id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Doctors;
