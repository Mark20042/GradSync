// components/FormSteps/JobPreferencesStep.js
import React, { useState } from "react";
import { FileText, Sparkles } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";
import { API_PATH } from "../../../../utils/apiPath";
import toast from "react-hot-toast";
import LocationDetectInput from "../../../../components/Input/LocationDetectInput";

const JobPreferencesStep = ({ formData, setFormData }) => {
  const handleJobPreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      jobPreferences: {
        ...prev.jobPreferences,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };


  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired Job Title
          </label>
          <input
            type="text"
            name="desiredJobTitle"
            value={formData.jobPreferences.desiredJobTitle}
            onChange={handleJobPreferenceChange}
            placeholder="e.g. Marketing Manager"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Industry
          </label>
          <input
            type="text"
            name="industry"
            value={formData.jobPreferences.industry}
            onChange={handleJobPreferenceChange}
            placeholder="e.g. Finance, Healthcare, Education"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>



        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Type
          </label>
          <select
            name="jobType"
            value={formData.jobPreferences.jobType}
            onChange={handleJobPreferenceChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select job type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Expectation (₱ per month)
          </label>
          <input
            type="number"
            name="salaryExpectation"
            value={formData.jobPreferences.salaryExpectation}
            onChange={handleJobPreferenceChange}
            placeholder="e.g. 75000"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            name="relocation"
            checked={formData.jobPreferences.relocation}
            onChange={handleJobPreferenceChange}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="ml-2 text-sm text-gray-700">
            Willing to relocate
          </label>
        </div>
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Resume (Optional)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileText className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX (MAX. 5MB)</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  resume: e.target.files[0],
                })
              }
            />
          </label>
        </div>
      </div>

      {/* Bio */}
      <div className="md:col-span-2 mt-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            About Me (Bio)
          </label>
        </div>
        <div className="relative">
          <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
          <textarea
            name="bio"
            rows={4}
            placeholder="Tell employers about yourself..."
            value={formData.bio || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default JobPreferencesStep;
