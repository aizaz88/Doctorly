import React, { useContext, useEffect } from "react";
import { AdminContext } from "../../context/AdminContext";

const DoctorsList = () => {
  const { doctors, token, getAllDoctors, updateAvailability } =
    useContext(AdminContext);

  useEffect(() => {
    if (token) {
      getAllDoctors();
    }
  }, [token]);

  const handleAvailabilityToggle = (doctorId, currentStatus) => {
    updateAvailability(doctorId, !currentStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
          All Doctors
        </h1>
        <p className="text-gray-600 mb-8">Manage doctor availability</p>

        {doctors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No doctors found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow hover:bg-blue-300 duration-300 overflow-hidden border border-gray-100"
              >
                {/* Card Header with Image */}
                <div className="relative h-32 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>

                {/* Card Body */}
                <div className="px-6 pt-16 pb-6">
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-sm text-blue-900 text-center font-medium mb-2">
                    {doctor.speciality}
                  </p>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                    <label className="flex items-center cursor-pointer gap-2 w-full justify-center">
                      <input
                        type="checkbox"
                        checked={doctor.available}
                        onChange={() =>
                          handleAvailabilityToggle(doctor._id, doctor.available)
                        }
                        className="w-5 h-5 rounded accent-green-500 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-700">
                        {doctor.available ? "Available" : "Unavailable"}
                      </span>
                      <span
                        className={`ml-auto px-2 py-1 text-xs font-medium rounded-full ${
                          doctor.available
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {doctor.available ? "Active" : "Offline"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsList;
