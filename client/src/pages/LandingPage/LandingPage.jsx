import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CompanyShowcase from "./components/CompanyShowcase";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import PublicJobSection from "./components/PublicJobSection";
import About from "./components/About";
import Creators from "./components/Creators";
import Contact from "./components/Contact";
import InDemandSkillsGraph from "../../components/InDemandSkillsGraph";

const LandingPage = () => {
  return (
    <div className="min-h-screen ">
      <Header />

      <Hero />
      <Creators />
      <CompanyShowcase />
      <HowItWorks />
      <Features />
      <PublicJobSection />
      
      <section className="relative bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 py-24">
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <InDemandSkillsGraph />
        </div>
      </section>

      <About />

      <Contact />
    </div>
  );
};

export default LandingPage;
