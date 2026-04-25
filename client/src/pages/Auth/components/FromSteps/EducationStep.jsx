// components/FormSteps/EducationStep.js
import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const EducationStep = ({ formData, setFormData }) => {
  const [newEducation, setNewEducation] = useState({
    school: "",
    degree: "",
    startDate: "",
    endDate: "",
    location: "",
    activities: "",
  });

  // --- FIX: Ensure formData.education is always an array before use ---
  const currentEducationList = formData.education || [];

  const addEducation = () => {
    if (newEducation.school) {
      setFormData((prev) => ({
        ...prev,
        // Use the safe list here too, though spread operator usually handles undefined okay
        education: [...(prev.education || []), newEducation],
      }));
      setNewEducation({
        school: "",
        degree: "",
        startDate: "",
        endDate: "",
        location: "",
        activities: "",
      });
    }
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      // Use the safe list for filtering
      education: (prev.education || []).filter((_, i) => i !== index),
    }));
  };

  // Helper for input changes
  const handleNewEduChange = (field, value) => {
    setNewEducation((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Form Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            School Name *
          </label>
          <input
            type="text"
            value={newEducation.school}
            onChange={(e) => handleNewEduChange("school", e.target.value)}
            placeholder="e.g. Cebu National High School"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Education Level *
          </label>
          <select
            value={newEducation.degree}
            onChange={(e) => handleNewEduChange("degree", e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select level</option>
            <option value="Elementary">Elementary</option>
            <option value="Junior High School">Junior High School</option>
            <option value="Senior High School">Senior High School</option>
            <option value="Vocational">Vocational/Training</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>{" "}
            {/* Added college */}
            <option value="Master's Degree">Master's Degree</option>{" "}
            {/* Added post-grad */}
            <option value="Doctorate">Doctorate</option> {/* Added post-grad */}
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={newEducation.location}
            onChange={(e) => handleNewEduChange("location", e.target.value)}
            placeholder="e.g. Cebu City, Philippines"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="month"
            value={newEducation.startDate}
            onChange={(e) => handleNewEduChange("startDate", e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date (or Expected)
          </label>
          <input
            type="month"
            value={newEducation.endDate}
            onChange={(e) => handleNewEduChange("endDate", e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Activities & Achievements (Optional)
          </label>
          <textarea
            value={newEducation.activities}
            onChange={(e) => handleNewEduChange("activities", e.target.value)}
            placeholder="e.g. Class President, Sports Team Captain, Science Fair Winner, Relevant Coursework..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add Button */}
      <button
        type="button"
        onClick={addEducation}
        className="flex items-center text-blue-600 font-medium text-sm px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Education
      </button>

      {/* Display Added Education */}
      {/* --- FIX: Check length on the safe currentEducationList --- */}
      {currentEducationList.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium text-gray-700 text-sm">Added Education</h4>
          {/* --- FIX: Map over the safe currentEducationList --- */}
          {currentEducationList.map((edu, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
            >
              <div>
                <p className="font-medium text-sm">{edu.school}</p>
                <p className="text-gray-600 text-xs">{edu.degree}</p>
                <p className="text-xs text-gray-500">
                  {/* Handle cases where dates might be missing */}
                  {edu.startDate || "N/A"} - {edu.endDate || "Present"}
                </p>
                {edu.location && (
                  <p className="text-xs text-gray-500">{edu.location}</p>
                )}
                {edu.activities && (
                  <p className="text-xs text-gray-600 mt-2">{edu.activities}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0" // Added margin and shrink
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EducationStep;
