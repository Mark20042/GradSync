import React from "react";
import { motion } from "framer-motion";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import hiringAnimation from "../../../assets/animations/hiring-process.json";

const About = () => {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center px-6 py-16 md:py-24">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-12 md:mb-16 text-center px-2"
        >
          All You Need to Know About{" "}
          <span className="text-purple-600">SipaCareer</span>
        </motion.h1>

        {/* Content (Responsive Grid) */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left Content */}
          <div>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-lg sm:text-xl text-gray-700 leading-relaxed mb-6 sm:mb-8 text-justify md:text-left"
            >
              <span className="font-semibold">SipaCareer</span> is an{" "}
              <span className="text-purple-600 font-semibold">
                automated job portal
              </span>{" "}
              built to connect{" "}
              <span className="text-blue-600 font-semibold">
                fresh graduates
              </span>{" "}
              with{" "}
              <span className="font-semibold text-green-600">companies</span>{" "}
              seamlessly. By generating professional profiles for students as
              they graduate, it helps them step into the workforce with ready
              tools that highlight their{" "}
              <span className="italic">skills, projects, and achievements</span>
              . At the same time, employers can register, post vacancies, and
              quickly find candidates that fit their needs.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: false, amount: 0.3 }}
              className="text-lg sm:text-xl text-gray-700 leading-relaxed text-justify md:text-left"
            >
              What makes SipaCareer unique is its{" "}
              <span className="font-semibold text-green-600">
                skill-based matching system
              </span>{" "}
              and integrated{" "}
              <span className="text-purple-600 font-semibold">
                real-time chat
              </span>{" "}
              that foster smooth collaboration between job seekers and
              companies. With features like a resume builder, portfolio uploads,
              and secure communication, SipaCareer ensures{" "}
              <span className="font-semibold">faster hiring</span>, stronger{" "}
              <span className="font-semibold">career growth</span>, and reliable{" "}
              <span className="font-semibold">data privacy</span>. It's more
              than just a job portal—it's a smarter and safer gateway to
              opportunities.
            </motion.p>
          </div>

          {/* Right Lottie Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: false, amount: 0.3 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-5xl md:max-w-2xl lg:max-w-3xl xl:max-w-6xl mr-30">
              <DotLottieReact
                data={hiringAnimation}
                loop
                autoplay
                style={{ width: "140%", height: "auto" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
