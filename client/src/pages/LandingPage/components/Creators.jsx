import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";
import pototImage from "../../../assets/images/potot.png";
import kennethImage from "../../../assets/images/kenneth.jpg";

const creators = [
  {
    name: "Mark Joseph Potot",
    role: "Fullstack Developer",
    // TODO: Attach your actual image here. You can import it at the top or put it in the public folder.
    // Example: image: "/assets/mark-image.jpg"
    image: pototImage, 
    description: "Architecting scalable systems and crafting seamless user experiences across the stack.",
    socials: {
      github: "#",
      linkedin: "#",
      email: "mailto:mark@example.com"
    },
    color: "from-purple-500 to-indigo-600"
  },
  {
    name: "Kenneth Alcontin",
    role: "System Analyst",
    // TODO: Attach your actual image here.
    // Example: image: "/assets/kenneth-image.jpg"
    image: kennethImage,
    description: "Translating complex requirements into efficient architectures and optimized workflows.",
    socials: {
      github: "#",
      linkedin: "#",
      email: "mailto:kenneth@example.com"
    },
    color: "from-blue-500 to-cyan-500"
  },
];

const Creators = () => {
  return (
    <section className="relative bg-white flex items-center justify-center py-16 md:py-24 px-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-300 opacity-20 blur-3xl mix-blend-multiply animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-indigo-300 opacity-20 blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-300 opacity-20 blur-3xl mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto z-10 w-full">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
          >
            Meet the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Minds</span> Behind It
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
          >
            The visionaries from <span className="font-bold text-gray-900 tracking-wide">CEBU ROOSEVELT MEMORIAL COLLEGES</span> who built this platform from the ground up, combining technical excellence with strategic analysis.
          </motion.p>
        </div>

        {/* Creators Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 lg:px-12">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.2, type: "spring", stiffness: 50 }}
              viewport={{ once: true, margin: "-100px" }}
              className="group relative bg-white rounded-3xl p-[2px] shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient Border Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${creator.color} opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
              
              <div className="relative h-full bg-white rounded-[22px] p-8 md:p-10 flex flex-col items-center text-center z-10">
                {/* Image Container with Hover Effects */}
                <div className="relative w-40 h-40 md:w-48 md:h-48 mb-8 rounded-full p-1.5 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-purple-100 group-hover:to-blue-100 transition-all duration-500">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-md relative z-10 bg-white">
                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  {/* Glowing blur behind image */}
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${creator.color} opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500`}></div>
                  
                  {/* Decorative badge */}
                  <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br ${creator.color} flex items-center justify-center shadow-lg border-2 border-white transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors duration-300">
                  {creator.name}
                </h3>
                
                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide uppercase mb-3 bg-gradient-to-r ${creator.color} text-transparent bg-clip-text bg-gray-50 border border-gray-100`}>
                  {creator.role}
                </span>

                <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest md:tracking-[0.2em] mb-6 text-center leading-snug px-2">
                  Cebu Roosevelt Memorial Colleges
                </p>

                <p className="text-gray-600 mb-8 leading-relaxed max-w-sm group-hover:text-gray-800 transition-colors duration-300">
                  {creator.description}
                </p>

                {/* Social Links */}
                <div className="flex items-center justify-center space-x-4 mt-auto">
                  <a href={creator.socials.github} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href={creator.socials.linkedin} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-blue-600 hover:text-white transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href={creator.socials.email} className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Creators;
