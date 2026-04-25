// components/FormSteps/ProjectsStep.js
import React, { useState } from "react";
import { Plus, X } from "lucide-react";

const ProjectsStep = ({ formData, setFormData }) => {
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    url: "",
    startDate: "",
    endDate: "",
    technologies: "",
  });

  const addProject = () => {
    if (newProject.name) {
      setFormData((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          {
            ...newProject,
            technologies: newProject.technologies
              .split(",")
              .map((t) => t.trim()),
          },
        ],
      }));
      setNewProject({
        name: "",
        description: "",
        url: "",
        startDate: "",
        endDate: "",
        technologies: "",
      });
    }
  };

  const removeProject = (index) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            placeholder="e.g. E-commerce Website"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project URL
          </label>
          <input
            type="url"
            value={newProject.url}
            onChange={(e) =>
              setNewProject({ ...newProject, url: e.target.value })
            }
            placeholder="https://..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            type="month"
            value={newProject.startDate}
            onChange={(e) =>
              setNewProject({ ...newProject, startDate: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            type="month"
            value={newProject.endDate}
            onChange={(e) =>
              setNewProject({ ...newProject, endDate: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technologies Used
          </label>
          <input
            type="text"
            value={newProject.technologies}
            onChange={(e) =>
              setNewProject({ ...newProject, technologies: e.target.value })
            }
            placeholder="e.g. React, Node.js, MongoDB, AWS"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
            placeholder="Describe the project, your role, and key achievements..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={addProject}
        className="flex items-center text-blue-600 font-medium text-sm px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Project
      </button>

      {formData.projects.length > 0 && (
        <div className="space-y-4 mt-6">
          <h4 className="font-medium text-gray-700 text-sm">Projects</h4>
          {formData.projects.map((project, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-between items-start"
            >
              <div>
                <p className="font-medium text-sm">{project.name}</p>
                <p className="text-gray-600 text-xs">
                  {project.technologies && project.technologies.join(", ")}
                </p>
                <p className="text-xs text-gray-500">
                  {project.startDate} - {project.endDate || "Present"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="text-red-500 hover:text-red-700"
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

export default ProjectsStep;
