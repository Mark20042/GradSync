import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CompanyShowcase from "./components/CompanyShowcase";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import PublicJobSection from "./components/PublicJobSection";
import About from "./components/About";
import Contact from "./components/Contact";
const LandingPage = () => {
  return (
    <div className="min-h-screen ">
      <Header />
      <Hero />
      <CompanyShowcase />
      <HowItWorks />
      <Features />
      <PublicJobSection />
      <About />
      <Contact />
    </div>
  );
};

export default LandingPage;
