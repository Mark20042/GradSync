import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.3 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const RegisterErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-modal-title"
    >
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="absolute inset-0"
        onClick={onClose}
      />
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-10 border border-gray-100"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-5 ring-8 ring-red-50/50">
            <AlertCircle className="w-10 h-10 text-red-600" strokeWidth={1.5} />
          </div>
          <h3
            id="error-modal-title"
            className="text-2xl font-extrabold text-gray-900 mb-3"
          >
            Registration Failed
          </h3>
          <p className="text-gray-500 leading-relaxed mb-8">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3.5 rounded-xl font-semibold hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-red-600/20"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterErrorModal;
