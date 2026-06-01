import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Key, ArrowLeft, Loader, AlertCircle, CheckCircle, Eye, EyeOff, UserCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import loginAnimation from "../../assets/animations/login.json";

const ForgotPassword = () => {
  const navigate = useNavigate();

  // Step 1: Check Email
  // Step 2: Confirm & Send OTP
  // Step 3: Verify OTP and Reset Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [userData, setUserData] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes timer

  useEffect(() => {
    let timerId;
    if (step === 3 && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [step, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when typing
  };

  // Step 1: Check if email exists
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Email is required");
      return;
    }
    const emailError = validateEmail(formData.email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.CHECK_EMAIL, {
        email: formData.email,
      });
      setUserData(response.data);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "We can't find your account.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Actually send the OTP
  const handleRequestOTP = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.FORGOT_PASSWORD, {
        email: formData.email,
      });
      setSuccessMsg(response.data.message || "OTP sent successfully to your email.");
      setTimeLeft(300);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.FORGOT_PASSWORD, {
        email: formData.email,
      });
      setSuccessMsg(response.data.message || "A new OTP has been sent to your email.");
      setTimeLeft(300);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!formData.otp) {
      setError("OTP is required");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.RESET_PASSWORD, {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });
      setSuccessMsg(response.data.message || "Password successfully reset!");
      
      // Navigate to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 3 && !successMsg.includes("successfully reset")) {
      setStep(2);
      setError("");
      setSuccessMsg("");
    } else if (step === 2) {
      setStep(1);
      setError("");
      setSuccessMsg("");
      setUserData(null);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 relative">
      <button
        type="button"
        onClick={handleBack}
        className="absolute top-4 left-4 flex items-center text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition z-10"
      >
        <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
        {step > 1 && !successMsg.includes("successfully reset") ? "Back" : "Back to Login"}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-8 md:gap-12 mt-16 sm:mt-0"
      >
        {/* Left Side - Lottie Animation */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
            <DotLottieReact
              data={loginAnimation}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="w-full md:w-1/2">
          <div className="text-center md:text-left mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Forgot Password
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {step === 1 && "Enter the email you used to login."}
              {step === 2 && "We found your account!"}
              {step === 3 && "Enter the OTP sent to your email and your new password"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-md flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleCheckEmail} 
                className="space-y-6"
              >
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Checking...</span>
                    </>
                  ) : (
                    <span>Check Email</span>
                  )}
                </button>
              </motion.form>
            )}

            {step === 2 && userData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="bg-white border border-gray-200 p-6 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
                  {userData.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover mb-4 border-2 border-blue-100" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4">
                      <UserCircle className="w-12 h-12" />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{userData.fullName}</h3>
                  <p className="text-gray-500 text-sm">{userData.email}</p>
                </div>

                <p className="text-gray-600 text-sm sm:text-base text-center md:text-left">
                  Would you like us to send a password reset code to this email address?
                </p>

                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Yes, Send OTP</span>
                  )}
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.form 
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleResetPassword} 
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      OTP Code
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Expires in: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span></span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={timeLeft > 0 || loading}
                        className={`text-xs font-medium transition ${timeLeft > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:underline"}`}
                      >
                        Resend Code
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="otp"
                      placeholder="Enter 6-digit OTP"
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base tracking-widest"
                      value={formData.otp}
                      onChange={handleInputChange}
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || (successMsg && !successMsg.includes("sent"))}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
