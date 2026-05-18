import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ThumbsUp } from "lucide-react";

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", bounce: 0.4, duration: 0.5 },
  },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const RegisterSuccessModal = ({ isOpen, onNavigate }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pending-modal-title"
        >
          {/* Overlay background */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0"
            onClick={onNavigate}
          />

          {/* Modal Container - Made wider with max-w-2xl and overflow-hidden for background effects */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full relative z-10 overflow-hidden border border-slate-100"
          >
            {/* Subtle top gradient accent bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />

            {/* Inner Content with generous horizontal padding for the wide look */}
            <div className="flex flex-col items-center text-center px-8 sm:px-16 py-14 sm:py-20 relative">
              {/* Background decorative glow behind the icon */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />

              {/* Icon Container */}
              <div className="relative w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center mb-8 ring-8 ring-blue-50/50 shadow-inner">
                <Clock className="w-12 h-12 text-blue-600" strokeWidth={1.5} />
              </div>

              {/* Typography */}
              <h2
                id="pending-modal-title"
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-5 leading-tight tracking-tight"
              >
                Registration Received!
              </h2>

              {/* Constrained width on the paragraph so it reads well on wide screens */}
              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                Great news! Your details have been securely submitted. Please
                give us some time to review your information.
                <br />
                <br />
                In the meantime,{" "}
                <strong className="text-slate-900 font-semibold">
                  keep an eye on your inbox.
                </strong>{" "}
                We’ll send an{" "}
                <strong className="text-slate-900 font-bold">email</strong> once
                your account verification is complete.
              </p>

              {/* Action Button */}
              <button
                onClick={onNavigate}
                className="w-full sm:w-3/4 max-w-md flex items-center justify-center gap-2 bg-blue-600 text-white text-lg py-4 rounded-2xl font-semibold hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-[0_8px_30px_rgb(37,99,235,0.2)]"
              >
                Okay, Got It!
                <ThumbsUp className="w-5 h-5 mb-0.5" strokeWidth={2} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default RegisterSuccessModal;
