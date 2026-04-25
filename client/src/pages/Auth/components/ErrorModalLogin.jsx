import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

const ErrorModalLogin = ({
  isOpen,
  onClose,
  message,
  isUnverified,
  onVerifyNav,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isUnverified ? "bg-amber-100" : "bg-red-100"}`}
          >
            <AlertCircle
              className={`w-8 h-8 ${isUnverified ? "text-amber-600" : "text-red-600"}`}
            />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isUnverified ? "Verification Required" : "Login Failed"}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          {isUnverified ? (
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={onVerifyNav}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Re-upload Docs
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorModalLogin;
