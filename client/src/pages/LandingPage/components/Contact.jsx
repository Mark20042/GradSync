import React from "react";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <section className="min-h-screen bg-gray-50 flex items-center px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-5xl mx-auto w-full">
        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 text-center"
        >
          Get in <span className="text-purple-600">Touch</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-base sm:text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto px-2"
        >
          Have questions, feedback, or just want to say hello? Fill out the form
          below and we’ll get back to you as soon as possible.
        </motion.p>

        {/* Contact Form */}
        <motion.form
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: false, amount: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 bg-white p-6 sm:p-10 rounded-3xl shadow-xl"
        >
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Message */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">
              Message
            </label>
            <textarea
              rows="5"
              placeholder="Write your message..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            ></textarea>
          </div>

          {/* Button */}
          <div className="md:col-span-2 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition"
            >
              Send Message
            </motion.button>
          </div>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;
