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
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Market Insights</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Discover what employers are looking for right now. Stay ahead of the curve by building the skills that land jobs.</p>
          </div>
          <InDemandSkillsGraph />
        </div>
      </section>

      <About />

      <Contact />
    </div>
  );
};

export default LandingPage;
