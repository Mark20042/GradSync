import React from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../../../context/AuthContext";
import HeroCards from "./HeroCards";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import jobportalAnimation from "../../../assets/animations/jobportal.json";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const Hero = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="relative bg-gradient-to-br from-slate-50 via-white to-blue-50/30 py-16 px-2 md:py-24 mb-8 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-100/40 to-purple-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 -z-10"></div>

      <div className="container mx-auto px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">

          {/* Left Content */}
          <div className="flex-3 text-center lg:text-left max-w-5xl">
            {/* <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Star className="w-4 h-4" />
              <span>#1 Job Portal for Fresh Graduates</span>
            </motion.div> */}

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-2xl sm:text-5xl md:text-6xl font-bold text-gray-900 tracking-tight leading-[1.1]"
            >
              Launch Your Career with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                SipaCareer
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg text-gray-500 max-w-md mx-auto lg:mx-0 leading-relaxed"
            >
              Connect fresh graduates with top employers. Your dream job is just a click away.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <button
                onClick={() => {
                  if (isAuthenticated && user?.role === "graduate") {
                    navigate("/find-jobs");
                  } else {
                    const jobsSection = document.getElementById('jobs-section');
                    if (jobsSection) {
                      jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl shadow-xl shadow-gray-900/20 font-semibold text-lg"
              >
                <Search className="w-5 h-5" />
                <span>Find Jobs</span>
              </button>

              <button
                onClick={() =>
                  navigate(
                    isAuthenticated && user?.role === "employer"
                      ? "/employer-dashboard"
                      : "/login"
                  )
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2  text-blue-600 px-8 py-4 rounded-2xl shadow-xl shadow-gray-600/20 font-semibold"
              >
                <span>Post a Job</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center lg:justify-start gap-8"
            >
              <div>
                <p className="text-2xl font-bold text-gray-900">10K+</p>
                <p className="text-sm text-gray-500">Active Jobs</p>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5K+</p>
                <p className="text-sm text-gray-500">Companies</p>
              </div>
              <div className="w-px h-10 bg-gray-200"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900">50K+</p>
                <p className="text-sm text-gray-500">Job Seekers</p>
              </div>
            </motion.div>
          </div>

          {/* Right Content - Lottie Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-2 flex justify-center lg:justify-end"
          >
            <div className="w-full max-w-full lg:w-[650px] xl:w-[670px]">
              <DotLottieReact
                data={jobportalAnimation}
                loop
                autoplay
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </motion.div>

          {/* Original HeroCards - Commented out for now */}
          {/* <HeroCards /> */}

        </div>
      </div>
    </section>
  );
};

export default Hero;
