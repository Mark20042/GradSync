// components/FormSteps/BasicInfoStep.js
import React from "react";
import { GraduationCap, Calendar, Award, MapPin } from "lucide-react";

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
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.university ? "border-red-500" : "border-gray-300"
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

      {/* Graduation Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Graduation Date *
        </label>
        <div className="flex gap-2">
          <div className="relative w-1/2">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="graduationMonth"
              value={formData.graduationMonth}
              onChange={handleChange}
              className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              required
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className="relative w-1/2">
            <input
              type="number"
              name="graduationYear"
              placeholder="Year"
              min="2000"
              max="2030"
              value={formData.graduationYear}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.graduationYear
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              required
            />
          </div>
        </div>
        {validationErrors.graduationYear && (
          <p className="text-red-500 text-xs mt-1">
            {validationErrors.graduationYear}
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
            placeholder="e.g. Bachelor of Science in Computer Science"
            value={formData.degree}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.degree ? "border-red-500" : "border-gray-300"
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
          placeholder="e.g. Computer Science"
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

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="address"
            placeholder="e.g. Cebu City, Philippines"
            value={formData.address}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
