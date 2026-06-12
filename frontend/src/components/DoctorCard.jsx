import React from "react";

const DoctorCard = ({ doctor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer
                 transition-all duration-300
                 hover:-translate-y-2 hover:shadow-lg
                 active:scale-95"
    >
      {/* Image Wrapper */}
      <div className="w-full aspect-[4/3] bg-blue-50">
        <img
          src={doctor.image}
          alt={doctor.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 text-sm text-green-500">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <p>Available</p>
        </div>

        <p className="text-gray-900 text-base sm:text-lg font-medium mt-1 truncate">
          {doctor.name}
        </p>

        <p className="text-gray-500 text-sm mt-1 truncate">
          {doctor.speciality}
        </p>
      </div>
    </div>
  );
};

export default DoctorCard;
