// components/FormSteps/ExperienceStep.js
import React, { useState } from "react";
import { Plus, X, Briefcase, BookOpen } from "lucide-react";

const ExperienceStep = ({ formData, setFormData }) => {
  const [newExperience, setNewExperience] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  const addExperience = (type) => {
    if (newExperience.title && newExperience.company) {
      if (type === "work") {
        setFormData((prev) => ({
          ...prev,
          experiences: [...prev.experiences, newExperience],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          internships: [...prev.internships, newExperience],
        }));
      }
      setNewExperience({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    }
  };

  const removeExperience = (index, type) => {
    if (type === "work") {
      setFormData((prev) => ({
        ...prev,
        experiences: prev.experiences.filter((_, i) => i !== index),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        internships: prev.internships.filter((_, i) => i !== index),
      }));
    }
  };

  const handleExperienceChange = (field, value) => {
    setNewExperience((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Selection Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, experienceType: "work" }))
          }
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            formData.experienceType === "work"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase className="w-4 h-4 inline mr-2" />
          Work Experience
        </button>
        <button
          type="button"
          onClick={() =>
            setFormData((prev) => ({ ...prev, experienceType: "internship" }))
          }
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            formData.experienceType === "internship"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4 inline mr-2" />
          Internships
        </button>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.experienceType === "work"
              ? "Job Title"
              : "Internship Role"}{" "}
            *
          </label>
          <input
            type="text"
            value={newExperience.title}
            onChange={(e) => handleExperienceChange("title", e.target.value)}
            placeholder={
              formData.experienceType === "work"
                ? "e.g. Software Engineer"
                : "e.g. Software Development Intern"
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <input
            type="text"
            value={newExperience.company}
            onChange={(e) => handleExperienceChange("company", e.target.value)}
            placeholder="Company name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            value={newExperience.location}
            onChange={(e) => handleExperienceChange("location", e.target.value)}
            placeholder={
              formData.experienceType === "work"
                ? "e.g. Cebu City, Philippines"
                : "e.g. Remote, Cebu City, etc."
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center md:col-span-2">
          <input
            type="checkbox"
            id={`current${formData.experienceType}`}
            checked={newExperience.current}
            onChange={(e) =>
              handleExperienceChange("current", e.target.checked)
            }
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor={`current${formData.experienceType}`}
            className="ml-2 text-sm text-gray-700"
          >
            {formData.experienceType === "work"
              ? "I currently work here"
              : "Current Internship"}
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <input
            type="month"
            value={newExperience.startDate}
            onChange={(e) =>
              handleExperienceChange("startDate", e.target.value)
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {!newExperience.current && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="month"
              value={newExperience.endDate}
              onChange={(e) =>
                handleExperienceChange("endDate", e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required={!newExperience.current}
            />
          </div>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={newExperience.description}
            onChange={(e) =>
              handleExperienceChange("description", e.target.value)
            }
            placeholder={
              formData.experienceType === "work"
                ? "Describe your responsibilities and achievements..."
                : "Describe your responsibilities, projects, and what you learned..."
            }
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => addExperience(formData.experienceType)}
        className="flex items-center text-blue-600 font-medium text-sm px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add{" "}
        {formData.experienceType === "work" ? "Work Experience" : "Internship"}
      </button>

      {/* Display added experiences */}
      {(formData.experiences.length > 0 || formData.internships.length > 0) && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium text-gray-700 text-sm">
            {formData.experienceType === "work"
              ? "Work Experience"
              : "Internships"}
          </h4>
          {(formData.experienceType === "work"
            ? formData.experiences
            : formData.internships
          ).map((exp, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
            >
              <div>
                <p className="font-medium text-sm">{exp.title}</p>
                <p className="text-gray-600 text-xs">{exp.company}</p>
                <p className="text-xs text-gray-500">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </p>
                {exp.description && (
                  <p className="text-xs text-gray-600 mt-2">
                    {exp.description}
                  </p>
                )}
                {formData.experienceType === "internship" && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-md">
                    Internship
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeExperience(index, formData.experienceType)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Show experiences from the other tab if they exist */}
      {formData.experienceType === "work" &&
        formData.internships.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 text-sm mb-2">
              You have {formData.internships.length} internship(s) added
            </h4>
            <p className="text-blue-600 text-xs">
              Switch to the Internships tab to view and manage them
            </p>
          </div>
        )}

      {formData.experienceType === "internship" &&
        formData.experiences.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 text-sm mb-2">
              You have {formData.experiences.length} work experience(s) added
            </h4>
            <p className="text-blue-600 text-xs">
              Switch to the Work Experience tab to view and manage them
            </p>
          </div>
        )}
    </div>
  );
};

export default ExperienceStep;
