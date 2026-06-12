import React from "react";
import Hero from "../components/Hero";
import SpecialityMenu from "../components/SpecialityMenu.jsx";
import TopDoctors from "../components/TopDoctors.jsx";
import Banner from "../components/Banner.jsx";

const Home = () => {
  return (
    <div>
      <Hero />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  );
};

export default Home;
