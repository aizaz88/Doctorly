import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import DoctorCard from "./DoctorCard";
import { useNavigate } from "react-router-dom";

const RelatedDoctors = ({ docId, speciality }) => {
  const { doctors } = useContext(AppContext);
  const navigate = useNavigate();

  const related = doctors.filter(
    (doc) => doc.speciality === speciality && doc._id !== docId,
  );

  return (
    <div className="mt-16">
      <h1 className="text-2xl font-medium text-center mb-6">Related Doctors</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {related.slice(0, 5).map((doc) => (
          <DoctorCard
            key={doc._id}
            doctor={doc}
            onClick={() => {
              navigate(`/appointment/${doc._id}`);
              scrollTo(0, 0);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedDoctors;
