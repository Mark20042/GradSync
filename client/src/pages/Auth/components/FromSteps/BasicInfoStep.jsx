import React, { useState } from "react";
import { GraduationCap, Calendar, Award, MapPin, Globe, Sparkles, FileText, Linkedin, Github } from "lucide-react";
import axiosInstance from "../../../../utils/axiosInstance";

import { API_PATH } from "../../../../utils/apiPath";
import toast from "react-hot-toast";
import LocationDetectInput from "../../../../components/Input/LocationDetectInput";

const BasicInfoStep = ({ formData, setFormData, validationErrors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* University */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          University *
        </label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="university"
            placeholder="Your university"
            value={formData.university}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.university ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
        </div>
        {validationErrors.university && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.university}
          </p>
        )}
      </div>

      {/* University Address */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          University Address *
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="universityAddress"
            placeholder="University exact address"
            value={formData.universityAddress || ""}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.universityAddress
                ? "border-red-500"
                : "border-gray-300"
              }`}
            required
          />
        </div>
        {validationErrors.universityAddress && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.universityAddress}
          </p>
        )}
      </div>

      {/* Birthdate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Birthdate
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="date"
            name="birthdate"
            value={
              formData.birthdate
                ? new Date(formData.birthdate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.birthdate ? "border-red-500" : "border-gray-300"
              }`}
          />
        </div>
        {validationErrors.birthdate && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.birthdate}
          </p>
        )}
      </div>

      {/* Graduation Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Graduation Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="month"
            name="graduationDate"
            value={formData.graduationDate || ""}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.graduationDate ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
        </div>
        {validationErrors.graduationDate && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.graduationDate}
          </p>
        )}
      </div>

      {/* University Start Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          University Start Date *
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="month"
            name="universityStartYear"
            value={formData.universityStartYear || ""}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.universityStartYear ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
        </div>
        {validationErrors.universityStartYear && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.universityStartYear}
          </p>
        )}
      </div>

      {/* Degree */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Degree *
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="degree"
            placeholder="e.g. Bachelor of Science in Business Administration"
            value={formData.degree}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.degree ? "border-red-500" : "border-gray-300"
              }`}
            required
          />
        </div>
        {validationErrors.degree && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.degree}</p>
        )}
      </div>

      {/* Major */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Major
        </label>
        <input
          type="text"
          name="major"
          placeholder="e.g. Business Administration"
          value={formData.major}
          onChange={handleChange}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="tel"
            name="phone"
            placeholder="e.g. +63 912 345 6789"
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Personal Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Personal Address
        </label>
        <div className="w-full">
          <LocationDetectInput
            name="address"
            placeholder="e.g. Cebu City, Philippines"
            value={formData.address || ""}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="url"
            name="website"
            placeholder="e.g. https://yourwebsite.com"
            value={formData.website || ""}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* LinkedIn */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          LinkedIn Profile
        </label>
        <div className="relative">
          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="url"
            name="linkedin"
            placeholder="e.g. https://linkedin.com/in/username"
            value={formData.linkedin || ""}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* GitHub */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          GitHub Profile
        </label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="url"
            name="github"
            placeholder="e.g. https://github.com/username"
            value={formData.github || ""}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
