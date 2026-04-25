// components/FormSteps/SkillsStep.js
import React, { useState } from "react";
import { Plus, X, Award, Trophy } from "lucide-react";

const SkillsStep = ({ formData, setFormData, validationErrors }) => {
  const [newLanguage, setNewLanguage] = useState({
    language: "",
    proficiency: "Basic",
  });

  const [newCertification, setNewCertification] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    expirationDate: "",
    credentialID: "",
    credentialURL: "",
  });

  const [newAward, setNewAward] = useState({
    title: "",
    issuer: "",
    date: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {
    if (newLanguage.language) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage],
      }));
      setNewLanguage({ language: "", proficiency: "Basic" });
    }
  };

  const removeLanguage = (index) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    if (newCertification.name) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification],
      }));
      setNewCertification({
        name: "",
        issuer: "",
        issueDate: "",
        expirationDate: "",
        credentialID: "",
        credentialURL: "",
      });
    }
  };

  const removeCertification = (index) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addAward = () => {
    if (newAward.title) {
      setFormData((prev) => ({
        ...prev,
        awards: [...prev.awards, newAward],
      }));
      setNewAward({
        title: "",
        issuer: "",
        date: "",
        description: "",
      });
    }
  };

  const removeAward = (index) => {
    setFormData((prev) => ({
      ...prev,
      awards: prev.awards.filter((_, i) => i !== index),
    }));
  };

  const handleCertificationChange = (field, value) => {
    setNewCertification((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAwardChange = (field, value) => {
    setNewAward((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skills *
        </label>
        <div className="relative">
          <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            name="skills"
            placeholder="e.g. JavaScript, React, Node.js, Python, UI/UX Design"
            value={formData.skills}
            onChange={handleChange}
            className={`w-full pl-11 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.skills ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Separate skills with commas
        </p>
        {validationErrors.skills && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.skills}</p>
        )}
      </div>

      {/* Languages Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Languages
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={newLanguage.language}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, language: e.target.value })
              }
              placeholder="Language"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={newLanguage.proficiency}
              onChange={(e) =>
                setNewLanguage({ ...newLanguage, proficiency: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Basic">Basic</option>
              <option value="Conversational">Conversational</option>
              <option value="Fluent">Fluent</option>
              <option value="Native">Native</option>
            </select>
          </div>
        </div>
        <button
          type="button"
          onClick={addLanguage}
          className="flex items-center text-blue-600 font-medium text-sm mt-3 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Language
        </button>

        {formData.languages.length > 0 && (
          <div className="space-y-3 mt-4">
            {formData.languages.map((lang, index) => (
              <div
                key={index}
                className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center"
              >
                <span className="text-sm">
                  {lang.language}{" "}
                  <span className="text-gray-500">({lang.proficiency})</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications & Awards Tabs */}
      <div className="pt-4">
        <div className="flex border-b border-gray-200 mb-5">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                certificationType: "certification",
              }))
            }
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              formData.certificationType === "certification"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Certifications
          </button>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({ ...prev, certificationType: "award" }))
            }
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              formData.certificationType === "award"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Awards
          </button>
        </div>

        {/* Certifications Form */}
        {formData.certificationType === "certification" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Name *
                </label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) =>
                    handleCertificationChange("name", e.target.value)
                  }
                  placeholder="e.g. AWS Certified Developer"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) =>
                    handleCertificationChange("issuer", e.target.value)
                  }
                  placeholder="e.g. Amazon Web Services"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date *
                </label>
                <input
                  type="month"
                  value={newCertification.issueDate}
                  onChange={(e) =>
                    handleCertificationChange("issueDate", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date
                </label>
                <input
                  type="month"
                  value={newCertification.expirationDate}
                  onChange={(e) =>
                    handleCertificationChange("expirationDate", e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  value={newCertification.credentialID}
                  onChange={(e) =>
                    handleCertificationChange("credentialID", e.target.value)
                  }
                  placeholder="e.g. AWS-12345"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential URL
                </label>
                <input
                  type="url"
                  value={newCertification.credentialURL}
                  onChange={(e) =>
                    handleCertificationChange("credentialURL", e.target.value)
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addCertification}
              className="flex items-center text-blue-600 font-medium text-sm mt-4 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Certification
            </button>

            {formData.certifications.length > 0 && (
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-gray-700 text-sm">
                  Certifications
                </h4>
                {formData.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{cert.name}</p>
                      <p className="text-gray-600 text-xs">{cert.issuer}</p>
                      <p className="text-xs text-gray-500">
                        Issued: {cert.issueDate}{" "}
                        {cert.expirationDate &&
                          `• Expires: ${cert.expirationDate}`}
                      </p>
                      {cert.credentialID && (
                        <p className="text-xs text-gray-500">
                          ID: {cert.credentialID}
                        </p>
                      )}
                      {cert.credentialURL && (
                        <p className="text-xs text-blue-600 truncate">
                          URL: {cert.credentialURL}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Awards Form */}
        {formData.certificationType === "award" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Award Title *
                </label>
                <input
                  type="text"
                  value={newAward.title}
                  onChange={(e) => handleAwardChange("title", e.target.value)}
                  placeholder="e.g. Dean's List"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  value={newAward.issuer}
                  onChange={(e) => handleAwardChange("issuer", e.target.value)}
                  placeholder="e.g. University of Cebu"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Received *
                </label>
                <input
                  type="month"
                  value={newAward.date}
                  onChange={(e) => handleAwardChange("date", e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newAward.description}
                  onChange={(e) =>
                    handleAwardChange("description", e.target.value)
                  }
                  placeholder="Describe the award and its significance..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={addAward}
              className="flex items-center text-blue-600 font-medium text-sm mt-4 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Award
            </button>

            {formData.awards.length > 0 && (
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-gray-700 text-sm">Awards</h4>
                {formData.awards.map((award, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{award.title}</p>
                      <p className="text-gray-600 text-xs">{award.issuer}</p>
                      <p className="text-xs text-gray-500">
                        Date: {award.date}
                      </p>
                      {award.description && (
                        <p className="text-xs text-gray-600 mt-2">
                          {award.description}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAward(index)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Show items from the other tab if they exist */}
      {formData.certificationType === "certification" &&
        formData.awards.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 text-sm mb-2">
              You have {formData.awards.length} award(s) added
            </h4>
            <p className="text-blue-600 text-xs">
              Switch to the Awards tab to view and manage them
            </p>
          </div>
        )}

      {formData.certificationType === "award" &&
        formData.certifications.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 text-sm mb-2">
              You have {formData.certifications.length} certification(s) added
            </h4>
            <p className="text-blue-600 text-xs">
              Switch to the Certifications tab to view and manage them
            </p>
          </div>
        )}
    </div>
  );
};

export default SkillsStep;
