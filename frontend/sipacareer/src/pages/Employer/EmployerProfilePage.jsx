import { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";
import { Building2, Globe, MapPin, Upload, Save, Trash2 } from "lucide-react";

const EmployerProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyDescription: "",
    website: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        companyName: user.companyName || "",
        companyDescription: user.companyDescription || "",
        website: user.website || "",
        address: user.address || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axiosInstance.put(
        API_PATH.AUTH.UPDATE_PROFILE,
        formData
      );
      updateUser(response.data);
      toast.success("Company profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      const response = await axiosInstance.post(
        API_PATH.IMAGE.ULOAD_IMAGE,
        uploadData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update user profile with new logo URL
      const updateResponse = await axiosInstance.put(API_PATH.AUTH.UPDATE_PROFILE, {
        companyLogo: response.data.avatarUrl,
      });

      updateUser(updateResponse.data);
      toast.success("Company logo updated");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    }
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        await axiosInstance.delete(API_PATH.AUTH.DELETE_ACCOUNT);
        toast.success("Account deleted successfully");
        logout();
        navigate("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        toast.error(error.response?.data?.message || "Failed to delete account");
      }
    }
  };

  return (
    <DashboardLayout activeMenu="company-profile">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Company Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Logo */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="relative inline-block mb-4">
                {user?.companyLogo ? (
                  <img
                    src={user.companyLogo}
                    alt="Company Logo"
                    className="w-32 h-32 rounded-xl object-cover border-2 border-gray-100"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-xl bg-gray-50 flex items-center justify-center border-2 border-gray-100 mx-auto">
                    <Building2 className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition shadow-lg transform translate-x-1/4 translate-y-1/4">
                  <Upload className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              <h3 className="font-semibold text-gray-900">{user?.companyName || "Company Name"}</h3>
              <p className="text-sm text-gray-500 mt-1">Employer Account</p>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="md:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter company name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  About Company
                </label>
                <textarea
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>

            {/* Delete Account */}
            <div className="bg-red-50 p-6 rounded-xl border border-red-100">
              <h3 className="text-lg font-bold text-red-700 mb-2">Account Deletion</h3>
              <p className="text-red-600 text-sm mb-6">
                Deleting your account is permanent. All your data, including job postings and messages, will be permanently removed.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-red-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerProfilePage;
