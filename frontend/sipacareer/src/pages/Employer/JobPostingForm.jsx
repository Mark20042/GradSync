import DashboardLayout from "../../components/layout/DashboardLayout";
import { useState } from "react";
import { MapPin, Users, Eye, Briefcase, AlertCircle, Send } from "lucide-react";

import { API_PATH } from "../../utils/apiPath";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

import { CATEGORIES, JOB_TYPES } from "../../utils/data";
import toast from "react-hot-toast";
import InputField from "../../components/Input/InputField";
import SelectField from "../../components/Input/SelectField";
import TextAreaField from "../../components/Input/TextAreaField";
import JobPostingPreview from "../../components/Cards/JobPostingPreview";
import { useEffect } from "react";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const jobId = location.state?.jobId || null;

  // formData now uses schema keys (title, type)
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    category: "",
    type: "",
    description: "",
    requirements: "",
    salaryMin: "",
    salaryMax: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    const jobPayload = {
      title: formData.title,
      location: formData.location,
      category: formData.category,
      type: formData.type,
      description: formData.description,
      requirements: formData.requirements,
      salaryMin: formData.salaryMin,
      salaryMax: formData.salaryMax,
    };

    try {
      const response = jobId
        ? await axiosInstance.put(API_PATH.JOBS.UPDATE_JOB(jobId), jobPayload)
        : await axiosInstance.post(API_PATH.JOBS.POST_JOB, jobPayload);

      if (response.status === 200 || response.status === 201) {
        toast.success(
          jobId ? "Job Updated Successfully" : "Job Posted Successfully"
        );
        setFormData({
          title: "",
          location: "",
          category: "",
          type: "",
          description: "",
          requirements: "",
          salaryMin: "",
          salaryMax: "",
        });
        navigate("/employer-dashboard");
        return;
      }
      console.error("Unexpected response", response);
      toast.error("Something went wrong! Try again later");
    } catch (error) {
      if (error.response?.data?.message) {
        console.error("API Error:", error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        console.error("Unexpected Error:", error);
        toast.error("Failed to post/update job. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }
    if (!formData.location.trim()) {
      errors.location = "Location is required";
    }
    if (!formData.category) {
      errors.category = "Category is required";
    }
    if (!formData.type) {
      errors.type = "Job type is required";
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }
    if (!formData.requirements.trim()) {
      errors.requirements = "Requirements are required";
    }

    if (!formData.salaryMin || !formData.salaryMax) {
      errors.salary = "Both minimum and maximum salary are required";
    } else if (parseInt(formData.salaryMin) >= parseInt(formData.salaryMax)) {
      errors.salary = "Maximum salary must be greater than the minimum salary";
    }

    return errors;
  };

  const isFormValid = () => {
    const validationErrors = validateForm(formData);
    return Object.keys(validationErrors).length === 0;
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (jobId) {
        try {
          const response = await axiosInstance.get(
            API_PATH.JOBS.GET_JOB_BY_ID(jobId)
          );

          const jobData = response.data;
          if (jobData) {
            setFormData({
              title: jobData.title,
              location: jobData.location,
              category: jobData.category,
              type: jobData.type,
              description: jobData.description,
              requirements: jobData.requirements,
              salaryMin: jobData.salaryMin,
              salaryMax: jobData.salaryMax,
            });
          }
        } catch (error) {
          console.error("Error fetching job details:", error);
          if (error.response?.data?.message) {
            console.error("API Error:", error.response.data.message);
            toast.error(error.response.data.message);
          } else {
            console.error("Unexpected Error:", error);
            toast.error("Failed to fetch job details. Please try again.");
          }
        }
      }
    };

    fetchJobDetails();
    return () => {};
  }, []);

  if (isPreview) {
    return (
      <DashboardLayout activeMenu="post-job">
        <JobPostingPreview formData={formData} setIsPreview={setIsPreview} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="post-job">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Post a new Job
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Fill out the form below to create your job posting
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreview(true)}
                  disabled={!isFormValid()}
                  className="group flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-white bg-white/50 hover:bg-gradient-to-r from-blue-500 to-blue-600 border border-gray-200 hover:border-transparent rounded-xl transition-all duration-300 shadow-lg shadow-gray-100 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Eye className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-6">
              {/* Job Title */}
              <InputField
                label="Job Title"
                id="title"
                placeholder="e.g., Senior Software Engineer"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                error={errors.title}
                required
                icon={Briefcase}
              />

              {/* Location */}
              <InputField
                label="Location"
                id="location"
                placeholder="e.g., IT Park, Ayala"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={errors.location}
                required
                icon={MapPin}
              />

              {/* Category & Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SelectField
                  label="Category"
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  options={CATEGORIES}
                  error={errors.category}
                  placeholder="Select a category"
                  required
                  icon={Users}
                />

                <SelectField
                  label="Job Type"
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  options={JOB_TYPES}
                  placeholder="Select job type"
                  error={errors.type}
                  required
                  icon={Briefcase}
                />
              </div>

              {/* Description */}
              <TextAreaField
                label="Job Description"
                id="description"
                placeholder="e.g., Describe the job role and responsibilities..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                error={errors.description}
                required
              />

              {/* Requirements */}
              <TextAreaField
                label="Requirements"
                id="requirements"
                placeholder="List key qualifications and skills..."
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                error={errors.requirements}
                required
              />

              {/* Salary Range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Salary range <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <span className="text-gray-500 font-bold">₱</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Min"
                      value={formData.salaryMin}
                      onChange={(e) =>
                        handleInputChange("salaryMin", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">₱</span>
                    </div>
                    <input
                      type="number"
                      placeholder="Max"
                      value={formData.salaryMax}
                      onChange={(e) =>
                        handleInputChange("salaryMax", e.target.value)
                      }
                      className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                </div>
                {errors.salary && (
                  <div className="flex items-center space-x-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.salary}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isFormValid()}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-4 border-white mr-2"></div>
                      Publishing Job...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      Publish Job
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobPostingForm;
