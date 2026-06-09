import {
  MapPin,
  Building2,
  Clock,
  ArrowLeft,
  Briefcase,
  PhilippinePeso,
  Calendar,
  CheckCircle,
  Share2,
  Gift,
  Award,
  Star,
  Globe
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { CATEGORIES, JOB_TYPES } from "../../../utils/data";
import FormattedText from "../../../components/FormattedText";

const JobPostingPreview = ({ formData, setIsPreview }) => {
  const { user } = useAuth();

  const formatPeso = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  // Parse skills appropriately
  let parsedSkills = [];
  if (formData.skills) {
    if (typeof formData.skills === 'string') {
      parsedSkills = formData.skills.split(',').map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(formData.skills)) {
      parsedSkills = formData.skills;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Top action bar specifically for Preview */}
      <div className="bg-white border-b border-gray-200 relative">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Job Preview
          </h2>
          <button
            onClick={() => setIsPreview(false)}
            className="group flex items-center space-x-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Edit</span>
          </button>
        </div>
      </div>

      {/* Hero Section - Enhanced with Gradient */}
      <div className="bg-gradient-to-b from-white to-blue-50/30 border-b border-gray-200 pt-12 pb-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex-shrink-0 bg-white p-1">
              {user?.companyLogo ? (
                <img
                  src={user?.companyLogo}
                  alt="Company Logo"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center rounded-xl">
                  <Building2 className="w-10 h-10 text-indigo-300" />
                </div>
              )}
            </div>

            {/* Job Header Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                    {formData.title || "Job Title"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1.5 font-medium px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      {user?.companyName || "Your Company"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      {formData.location || "Location"}
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm">
                      <Clock className="w-4 h-4 text-orange-500" />
                      Posted Just now
                    </span>
                  </div>
                </div>

                {/* Apply Actions Mocked */}
                <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 xl:mt-0">
                  <div className="flex items-center gap-3 w-full sm:w-auto opacity-50 cursor-not-allowed" title="Buttons are disabled in preview">
                    <button disabled className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100 shadow-sm">
                  {JOB_TYPES.find((j) => j.value === formData.type)?.label || "Job Type"}
                </span>
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100 shadow-sm">
                  {CATEGORIES.find((c) => c.value === formData.category)?.label || "Category"}
                </span>
                <span className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-lg border border-green-100 shadow-sm">
                  {formData.salaryMin && formData.salaryMax
                    ? `${formatPeso(formData.salaryMin)} - ${formatPeso(formData.salaryMax)}`
                    : "Competitive Salary"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Professional Job Overview Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
                  <PhilippinePeso className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Salary</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {formData.salaryMin && formData.salaryMax
                      ? `${formatPeso(formData.salaryMin)} - ${formatPeso(formData.salaryMax)}`
                      : "Competitive"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Job Type</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">
                    {JOB_TYPES.find((j) => j.value === formData.type)?.label || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Posted</p>
                  <p className="text-sm font-bold text-gray-900 mt-0.5">Today</p>
                </div>
              </div>
            </section>

            {/* Description */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                Job Description
              </h2>
              <FormattedText text={formData.description || "No description provided."} className="text-base" />
            </section>

            {/* Requirements */}
            <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                  <CheckCircle className="w-5 h-5" />
                </div>
                Requirements
              </h2>
              <FormattedText text={formData.requirements || "No requirements provided."} className="text-base" />
            </section>

            {/* Qualifications */}
            {formData.qualifications && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Award className="w-5 h-5" />
                  </div>
                  Qualifications
                </h2>
                <FormattedText text={formData.qualifications} className="text-base" />
              </section>
            )}

            {/* Skills */}
            {parsedSkills.length > 0 && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Star className="w-5 h-5" />
                  </div>
                  Skills Required
                </h2>
                <div className="flex flex-wrap gap-2">
                  {parsedSkills.map((skill, index) => (
                    <span key={index} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-xl text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {formData.benefits && (
              <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg text-green-600">
                    <Gift className="w-5 h-5" />
                  </div>
                  Company Benefits
                </h2>
                <FormattedText text={formData.benefits} className="text-base" />
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">About the Company</h3>

              </div>

              <div className="flex items-center gap-3 mb-2">
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt="Company Logo"
                    className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Building2 className="w-7 h-7 text-gray-400" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {user?.companyName || "Your Company"}
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user?.address || formData.location || "Company Address"}
                  </p>
                </div>
              </div>

              {user?.companyDescription && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {user.companyDescription}
                  </p>
                </div>
              )}

              {user?.website && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPostingPreview;
