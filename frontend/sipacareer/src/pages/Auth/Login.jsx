import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "./../../utils/helper";
import axiosInstance from "./../../utils/axiosInstance";
import { API_PATH } from "./../../utils/apiPath";
import { useAuth } from "../../context/AuthContext";

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, message }) => {
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Login Failed
          </h3>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [formState, setFormState] = useState({
    loading: false,
    error: {},
    showPassword: false,
    success: false,
    showErrorModal: false, // New state for modal
    errorMessage: "",      // New state for modal message
  });

  // Validation for password
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error message when typing
    if (formState.error[name]) {
      setFormState((prev) => ({
        ...prev,
        error: {
          ...prev.error,
          [name]: "",
        },
      }));
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({
      ...prev,
      error: errors,
    }));

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormState((prev) => ({ ...prev, loading: true, error: {} }));

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
      }));

      const { token, role, isAdmin } = response.data;

      if (token) {
        login(response.data, token);

        //Redirect based on admin status and role
        setTimeout(() => {
          let redirectPath = "/find-jobs"; // default for graduates

          if (isAdmin) {
            redirectPath = "/admin-dashboard";
          } else if (role === "employer") {
            redirectPath = "/employer-dashboard";
          }

          window.location.href = redirectPath;
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data.message || "Login failed. Please check your credentials.";

      setFormState((prev) => ({
        ...prev,
        loading: false,
        showErrorModal: true, // Show modal
        errorMessage: errorMessage,
        error: {
          submit: errorMessage,
        },
      }));
    }
  };

  if (formState.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full text-center max-w-md mt-16 sm:mt-0"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mb-4 mx-auto" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome Back!
          </h2>
          <p className="text-gray-600 mb-4">
            You have been successfully logged in.
          </p>

          {/* Loader centered */}
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Redirecting to your dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 relative">
      {/* Error Modal */}
      <ErrorModal
        isOpen={formState.showErrorModal}
        onClose={() => setFormState(prev => ({ ...prev, showErrorModal: false }))}
        message={formState.errorMessage}
      />

      {/* Back to Home */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
        Back to Home
      </button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md mt-16 sm:mt-0"
      >
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Sign in to your{" "}
            <span className="text-blue-600 font-semibold">SipaCareer</span>{" "}
            account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm sm:text-base ${formState.error.email ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 transition-colors focus:ring-blue-500 focus:border-transparent`}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            {formState.error.email && (
              <p className="text-red-500 flex items-center gap-1 text-sm mt-1">
                <AlertCircle className="w-4 h-4" />
                {formState.error.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={formState.showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className={`w-full pl-10 pr-12 py-3 rounded-lg border text-sm sm:text-base ${formState.error.password
                  ? "border-red-500"
                  : "border-gray-300"
                  } focus:outline-none focus:ring-2 transition-colors focus:ring-blue-500 focus:border-transparent`}
                value={formData.password}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    showPassword: !prev.showPassword,
                    showErrorModal: false, // Close modal on password toggle
                  }))
                }
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {formState.showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
            {formState.error.password && (
              <p className="text-red-500 flex items-center text-sm mt-1">
                <AlertCircle className="mr-1 w-4 h-4" />
                {formState.error.password}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={formState.loading}
            className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
          >
            {formState.loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Create Account */}
          <p className="text-center text-sm sm:text-base text-gray-600 mt-6">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-blue-600 font-medium hover:underline"
            >
              Create Account
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
