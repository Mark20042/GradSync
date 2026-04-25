import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  Loader,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Degrees } from "./../../utils/data";
import {
  validateEmail,
  validatePassword,
  validateAvatar,
} from "../../utils/helper";
import uploadImage from "../../utils/uploadImage";
import axiosInstance from "./../../utils/axiosInstance";
import { API_PATH } from "./../../utils/apiPath";
import { useAuth } from "../../context/AuthContext";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import registerAnimation from "../../assets/animations/register.json";
import RegisterErrorModal from "../../components/Modals/RegisterErrorModal";
import RegisterSuccessModal from "../../components/Modals/RegisterSuccessModal";

const SignUp = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "",
    degree: "",
    companyName: "",
    avatar: null,
    tor: null,
    businessPermit: null,
  });

  const [formState, setFormState] = useState({
    loading: false,
    error: {},
    showPassword: false,
    success: false,
    avatarPreview: null,
    showErrorModal: false,
    errorMessage: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formState.error[name]) {
      setFormState((prev) => ({
        ...prev,
        error: { ...prev.error, [name]: "" },
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateAvatar(file);
      if (error) {
        setFormState((prev) => ({
          ...prev,
          error: { ...prev.error, avatar: error },
          avatarPreview: null,
        }));
        return;
      }
      setFormData((prev) => ({ ...prev, avatar: file }));

      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormState((prev) => ({
          ...prev,
          avatarPreview: reader.result,
          error: { ...prev.error, avatar: "" },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRoleChange = (role) => {
    setFormData((prev) => ({ ...prev, role, degree: "", companyName: "" }));
    if (formState.error.role) {
      setFormState((prev) => ({
        ...prev,
        error: { ...prev.error, role: "" },
      }));
    }
  };

  const validateForm = () => {
    let errors = {
      fullName: !formData.fullName.trim() ? "Full Name is required." : "",
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      role: !formData.role ? "Please select a role." : "",
      avatar: "",
    };

    if (formData.role === "graduate") {
      errors.degree = !formData.degree ? "Please select your degree." : "";
      if (!formData.tor) errors.tor = "Transcript of Records is required.";
    }
    if (formData.role === "employer") {
      errors.companyName = !formData.companyName.trim()
        ? "Company Name is required."
        : "";
      if (!formData.businessPermit)
        errors.businessPermit = "Business Permit is required.";
    }

    // Remove empty error keys
    Object.keys(errors).forEach((key) => {
      if (!errors[key]) delete errors[key];
    });

    setFormState((prev) => ({ ...prev, error: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleDocumentChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!validTypes.includes(file.type)) {
        setFormState((prev) => ({
          ...prev,
          error: {
            ...prev.error,
            [fieldName]: "Please upload a PDF or Image file.",
          },
        }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormState((prev) => ({
          ...prev,
          error: {
            ...prev.error,
            [fieldName]: "File size must be less than 10MB.",
          },
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      setFormState((prev) => ({
        ...prev,
        error: { ...prev.error, [fieldName]: "" },
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("=== Starting Registration ===");
    setFormState((prev) => ({ ...prev, loading: true, error: {} }));

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", formData.role);

      if (formData.role === "graduate") {
        formDataToSend.append("degree", formData.degree);
        if (formData.tor) {
          formDataToSend.append("tor", formData.tor);
        }
      } else if (formData.role === "employer") {
        formDataToSend.append("companyName", formData.companyName);
        if (formData.businessPermit) {
          formDataToSend.append("businessPermit", formData.businessPermit);
        }
      }

      if (formData.avatar) {
        formDataToSend.append("avatar", formData.avatar);
      }

      console.log("Registering user...");
      const response = await axiosInstance.post(
        API_PATH.AUTH.REGISTER,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      console.log("Registration successful:", response.data);

      // We expect the server to return verificationPending since OCR is now backgrounded
      if (response.data.verificationPending) {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          success: true,
          error: {},
        }));
        return; // Pause here to let modal show
      }

      // Check if document verification failed explicitly (fallback)
      if (response.data.verificationFailed) {
        setFormState((prev) => ({
          ...prev,
          loading: false,
          showErrorModal: true,
          errorMessage:
            response.data.message ||
            "Document verification failed. Please try again with a clearer document.",
          error: {},
        }));
        return; // Don't proceed with login
      }

      // If not pending, process as a direct success
      // For graduates: Extract token and user data from response
      const { token, ...userData } = response.data;

      if (!token && !response.data.verificationPending) {
        throw new Error("No token received from server");
      }

      // Show success state
      setFormState((prev) => ({
        ...prev,
        loading: false,
        success: true,
        error: {},
      }));

      // Removed auto-login and redirect as user needs to hold for verification email
    } catch (error) {
      console.error("=== Registration Error ===");
      console.error("Error:", error);
      console.error("Response:", error.response);

      let errorMessage = "Registration failed. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        console.error("Status:", status);
        console.error("Data:", data);

        if (status === 400) {
          errorMessage =
            data?.message || "User already exists or invalid data.";
        } else if (status === 401) {
          errorMessage = "Authentication error. Please try again.";
        } else if (status === 409) {
          errorMessage = "Email already exists. Please use a different email.";
        } else if (status === 500) {
          errorMessage =
            data?.message || "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || data?.error || `Error: ${status}`;
        }
      } else if (error.request) {
        console.error("No response from server");
        errorMessage =
          "Cannot connect to server. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }

      setFormState((prev) => ({
        ...prev,
        loading: false,
        showErrorModal: true,
        errorMessage: errorMessage,
        error: {
          submit: errorMessage,
        },
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 relative py-8">
      {/* Error Modal */}
      <RegisterErrorModal
        isOpen={formState.showErrorModal}
        onClose={() =>
          setFormState((prev) => ({ ...prev, showErrorModal: false }))
        }
        message={formState.errorMessage}
      />

      {/* Success Modal */}
      <RegisterSuccessModal
        isOpen={formState.success}
        onNavigate={() => navigate("/")}
      />

      {/* Back to Home */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center text-lg sm:text-xl font-semibold text-gray-800 hover:text-blue-600 transition z-10"
      >
        <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7 mr-2" />
        Back to Home
      </button>

      {/* Main Container - Two Column Layout */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mt-16 sm:mt-0">
        {/* Left Side - Lottie Animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex w-full lg:w-2/5 justify-center items-center"
        >
          <div className="w-80 h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
            <DotLottieReact
              data={registerAnimation}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </motion.div>

        {/* Right Side - Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-3/5"
        >
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your GradSync Account
            </h2>
            <p className="text-gray-600">
              Fueling your first step — bridging bright graduates with top
              employers
            </p>
          </div>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* Left Column */}
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formState.error.fullName
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                  />
                </div>
                {formState.error.fullName && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formState.error.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email address"
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      formState.error.email
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all `}
                  />
                </div>
                {formState.error.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formState.error.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={formState.showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    className={`w-full pl-10 pr-10 py-3 rounded-lg border ${
                      formState.error.password
                        ? "border-red-500"
                        : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {formState.showPassword ? (
                      <Eye className="w-5 h-5" />
                    ) : (
                      <EyeOff className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {formState.error.password && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formState.error.password}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("graduate")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      formData.role === "graduate"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <GraduationCap className="w-6 h-6" />
                    <div className="font-medium">Fresh Graduate</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange("employer")}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      formData.role === "employer"
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Building2 className="w-6 h-6" />
                    <div className="font-medium">Employer</div>
                  </button>
                </div>
                {formState.error.role && (
                  <p className="text-sm text-red-500 mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formState.error.role}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture / Company Logo (Optional)
                </label>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  {/* Avatar Preview */}
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {formState.avatarPreview ? (
                      <img
                        src={formState.avatarPreview}
                        alt="Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-200 text-gray-400">
                        <User className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex flex-col flex-grow">
                    <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 shadow-sm transition text-sm font-medium">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                      <input
                        type="file"
                        name="avatar"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG. Max 5MB.
                    </p>
                  </div>
                </div>

                {formState.error.avatar && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {formState.error.avatar}
                  </p>
                )}
              </div>

              {/* Dynamic Fields based on Role */}
              <div className="min-h-[120px]">
                {/* Degree (Graduate) */}
                {formData.role === "graduate" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Your Degree *
                      </label>
                      <select
                        name="degree"
                        value={formData.degree}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formState.error.degree
                            ? "border-red-500"
                            : "border-gray-300"
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white`}
                      >
                        <option value="">Choose Degree</option>
                        {Object.keys(Degrees).map((key) => (
                          <option key={key} value={Degrees[key]}>
                            {Degrees[key]}
                          </option>
                        ))}
                      </select>
                      {formState.error.degree && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formState.error.degree}
                        </p>
                      )}
                    </div>

                    {/* TOR Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Transcript of Records (TOR) *
                      </label>
                      <label className="cursor-pointer flex flex-col items-center justify-center px-4 py-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition w-full group">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center">
                          {formData.tor
                            ? formData.tor.name
                            : "Click to upload TOR"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF or Image (Max 10MB)
                        </span>
                        <input
                          type="file"
                          name="tor"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleDocumentChange(e, "tor")}
                          className="hidden"
                        />
                      </label>
                      {formState.error.tor && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formState.error.tor}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Company Name & Permit (Employer) */}
                {formData.role === "employer" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-5"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="Enter your company name"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            formState.error.companyName
                              ? "border-red-500"
                              : "border-gray-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all`}
                        />
                      </div>
                      {formState.error.companyName && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formState.error.companyName}
                        </p>
                      )}
                    </div>

                    {/* Business Permit Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Business Permit *
                      </label>
                      <label className="cursor-pointer flex flex-col items-center justify-center px-4 py-6 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 transition w-full group">
                        <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-blue-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 text-center">
                          {formData.businessPermit
                            ? formData.businessPermit.name
                            : "Click to upload Permit"}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          PDF or Image (Max 10MB)
                        </span>
                        <input
                          type="file"
                          name="businessPermit"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) =>
                            handleDocumentChange(e, "businessPermit")
                          }
                          className="hidden"
                        />
                      </label>
                      {formState.error.businessPermit && (
                        <p className="text-sm text-red-500 mt-1 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {formState.error.businessPermit}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit Button - Spans full width */}
            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={formState.loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
              >
                {formState.loading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Verifying Documents...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              {/* Already have an account */}
              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
