import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Trash2, Search, Shield, Edit, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "../../components/Admin/AdminModal";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [showSavedJobsModal, setShowSavedJobsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.USERS);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (user) => {
        setViewingUser(user);
        setShowViewModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await axiosInstance.delete(API_PATH.ADMIN.DELETE_USER(userId));
            setUsers(users.filter((user) => user._id !== userId));
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const handleEdit = (user) => {
        setEditingUser({ ...user });
        setShowEditModal(true);
    };

    const handleAdd = () => {
        setEditingUser({
            fullName: "",
            email: "",
            password: "", // Only for creation
            role: "graduate",
            phone: "",
            address: "",
            website: "",
            // Graduate specific defaults
            university: "",
            degree: "",
            major: "",
            graduationYear: "",
            linkedin: "",
            github: "",
            portfolio: "",
            jobPreferences: {
                desiredJobTitle: "",
                jobType: "",
                industry: "",
                preferredLocation: "",
                salaryExpectation: "",
                relocation: false
            },
            skills: [],
            languages: [],
            experiences: [],
            internships: [],
            awards: [],
            certifications: [],
            projects: []
        });
        setShowEditModal(true);
    };

    const handleImageUpload = async (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("image", file);

        try {
            setImageUploading(true);
            const response = await axiosInstance.post(API_PATH.ADMIN.UPLOAD, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setEditingUser({ ...editingUser, [fieldName]: response.data.imageUrl });
            toast.success("Image uploaded successfully");
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Failed to upload image");
        } finally {
            setImageUploading(false);
        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser._id) {
                // Update existing user
                // Remove password from update payload if empty or not needed (backend handles this usually, but let's be safe)
                const { password, ...updateData } = editingUser;
                const response = await axiosInstance.put(API_PATH.ADMIN.UPDATE_USER(editingUser._id), updateData);
                setUsers(users.map((user) => (user._id === editingUser._id ? { ...user, ...response.data } : user)));
                toast.success("User updated successfully");
            } else {
                // Create new user
                const response = await axiosInstance.post(API_PATH.ADMIN.CREATE_USER, editingUser);
                setUsers([...users, response.data]);
                toast.success("User created successfully");
            }
            setShowEditModal(false);
            setEditingUser(null);
        } catch (error) {
            console.error("Error saving user:", error);
            toast.error(error.response?.data?.message || "Failed to save user");
        }
    };

    const handleViewSavedJobs = async (user) => {
        setSelectedUser(user);
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.USER_SAVED_JOBS(user._id));
            setSavedJobs(response.data);
            setShowSavedJobsModal(true);
        } catch (error) {
            console.error("Error fetching saved jobs:", error);
            toast.error("Failed to fetch saved jobs");
        }
    };

    const filteredUsers = users.filter(
        (user) =>
            user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-users">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-users">
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                            />
                        </div>
                        <button
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <Plus className="w-5 h-5" />
                            Add User
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider pl-8">User</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Role</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-5 font-semibold text-gray-400 text-xs uppercase tracking-wider text-center pr-8">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-blue-50/30 transition-colors duration-200 group">
                                    <td className="px-6 py-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100 ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${user.role === 'employer' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
                                                        {user.fullName.charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {user.fullName}
                                                </p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold inline-block shadow-sm ${user.role === "employer"
                                                ? "bg-purple-50 text-purple-700 border border-purple-100"
                                                : "bg-blue-50 text-blue-700 border border-blue-100"
                                                }`}
                                        >
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {user.isAdmin ? (
                                            <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                                                <Shield className="w-3.5 h-3.5" /> Admin
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm font-medium">User</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-gray-500 text-sm font-medium">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleView(user)}
                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                title="Edit User"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            {user.role === "graduate" && (
                                                <button
                                                    onClick={() => handleViewSavedJobs(user)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                    title="View Saved Jobs"
                                                >
                                                    <Search className="w-5 h-5" />
                                                </button>
                                            )}
                                            {!user.isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            <AdminModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={editingUser?._id ? "Edit User" : "Add User"}
            >
                {editingUser && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.fullName}
                                        onChange={(e) => setEditingUser({ ...editingUser, fullName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                {!editingUser._id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                        <input
                                            type="password"
                                            value={editingUser.password}
                                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingUser.role}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="graduate">Graduate</option>
                                        <option value="employer">Employer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="text"
                                        value={editingUser.phone || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={editingUser.address || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="text"
                                        value={editingUser.website || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, website: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Profile Image Upload */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
                                {editingUser.role === "graduate" ? "Profile Picture" : "Company Logo"}
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                                    {(editingUser.role === "graduate" ? editingUser.avatar : editingUser.companyLogo) ? (
                                        <img
                                            src={editingUser.role === "graduate" ? editingUser.avatar : editingUser.companyLogo}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-2">No image</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {editingUser.role === "graduate" ? "Upload Avatar" : "Upload Company Logo"}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, editingUser.role === "graduate" ? "avatar" : "companyLogo")}
                                        disabled={imageUploading}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                    />
                                    {imageUploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                                </div>
                            </div>
                        </div>

                        {/* Graduate Specific */}
                        {editingUser.role === "graduate" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Education</h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newEducation = [...(editingUser.education || []), {
                                                school: "",
                                                degree: "",
                                                startDate: "",
                                                endDate: "",
                                                location: "",
                                                activities: ""
                                            }];
                                            setEditingUser({ ...editingUser, education: newEducation });
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Education
                                    </button>
                                </div>

                                {editingUser.education && editingUser.education.length > 0 ? (
                                    <div className="space-y-4">
                                        {editingUser.education.map((edu, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newEducation = editingUser.education.filter((_, i) => i !== index);
                                                        setEditingUser({ ...editingUser, education: newEducation });
                                                    }}
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="grid grid-cols-2 gap-4 pr-8">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">School *</label>
                                                        <input
                                                            type="text"
                                                            value={edu.school || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].school = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                            required
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                                        <input
                                                            type="text"
                                                            value={edu.degree || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].degree = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].startDate = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].endDate = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            value={edu.location || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].location = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
                                                        <textarea
                                                            value={edu.activities || ""}
                                                            onChange={(e) => {
                                                                const newEducation = [...editingUser.education];
                                                                newEducation[index].activities = e.target.value;
                                                                setEditingUser({ ...editingUser, education: newEducation });
                                                            }}
                                                            rows="2"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 bg-gray-50 rounded-lg border border-gray-200 text-center">
                                        <p className="text-gray-500 text-sm">No education entries. Click "Add Education" to add one.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Graduate Specific - Professional Links */}
                        {editingUser.role === "graduate" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Professional</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                                        <input
                                            type="text"
                                            value={editingUser.linkedin || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, linkedin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                                        <input
                                            type="text"
                                            value={editingUser.github || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, github: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                                        <input
                                            type="text"
                                            value={editingUser.portfolio || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, portfolio: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Job Preferences */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Job Preferences</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Desired Job Title</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.desiredJobTitle || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, desiredJobTitle: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                                        <select
                                            value={editingUser.jobPreferences?.jobType || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, jobType: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        >
                                            <option value="">Select Type</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Remote">Remote</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.industry || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, industry: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Location</label>
                                        <input
                                            type="text"
                                            value={editingUser.jobPreferences?.preferredLocation || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, preferredLocation: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation (₱)</label>
                                        <input
                                            type="number"
                                            value={editingUser.jobPreferences?.salaryExpectation || ""}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, salaryExpectation: e.target.value }
                                            })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                    <div className="flex items-center pt-6">
                                        <input
                                            type="checkbox"
                                            id="relocation"
                                            checked={editingUser.jobPreferences?.relocation || false}
                                            onChange={(e) => setEditingUser({
                                                ...editingUser,
                                                jobPreferences: { ...editingUser.jobPreferences, relocation: e.target.checked }
                                            })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="relocation" className="ml-2 text-sm font-medium text-gray-700">Willing to Relocate</label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Skills */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Skills</h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        value={editingUser.skills ? editingUser.skills.join(", ") : ""}
                                        onChange={(e) => setEditingUser({
                                            ...editingUser,
                                            skills: e.target.value.split(",").map(skill => skill.trim())
                                        })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g. React, Node.js, Python"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Languages */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Languages</h4>
                                <div className="space-y-4">
                                    {editingUser.languages && editingUser.languages.map((lang, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <input
                                                type="text"
                                                value={lang.language}
                                                onChange={(e) => {
                                                    const newLanguages = [...editingUser.languages];
                                                    newLanguages[index].language = e.target.value;
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                placeholder="Language (e.g. English)"
                                            />
                                            <select
                                                value={lang.proficiency}
                                                onChange={(e) => {
                                                    const newLanguages = [...editingUser.languages];
                                                    newLanguages[index].proficiency = e.target.value;
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="w-40 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="Basic">Basic</option>
                                                <option value="Conversational">Conversational</option>
                                                <option value="Fluent">Fluent</option>
                                                <option value="Native">Native</option>
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newLanguages = editingUser.languages.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, languages: newLanguages });
                                                }}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <i className="fas fa-trash"></i> Remove
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newLanguages = [...(editingUser.languages || []), { language: "", proficiency: "Basic" }];
                                            setEditingUser({ ...editingUser, languages: newLanguages });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Language
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Experience (Simplified Edit) */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Experience</h4>
                                <div className="space-y-4">
                                    {editingUser.experiences && editingUser.experiences.map((exp, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={exp.title}
                                                    onChange={(e) => {
                                                        const newExperiences = [...editingUser.experiences];
                                                        newExperiences[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, experiences: newExperiences });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={exp.company}
                                                    onChange={(e) => {
                                                        const newExperiences = [...editingUser.experiences];
                                                        newExperiences[index].company = e.target.value;
                                                        setEditingUser({ ...editingUser, experiences: newExperiences });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Company"
                                                />
                                            </div>
                                            <textarea
                                                value={exp.description}
                                                onChange={(e) => {
                                                    const newExperiences = [...editingUser.experiences];
                                                    newExperiences[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, experiences: newExperiences });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newExperiences = editingUser.experiences.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, experiences: newExperiences });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Experience
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newExperiences = [...(editingUser.experiences || []), { title: "New Role", company: "New Company", description: "", startDate: new Date(), current: true }];
                                            setEditingUser({ ...editingUser, experiences: newExperiences });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Experience
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Internships */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Internships</h4>
                                <div className="space-y-4">
                                    {editingUser.internships && editingUser.internships.map((internship, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={internship.title}
                                                    onChange={(e) => {
                                                        const newInternships = [...editingUser.internships];
                                                        newInternships[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, internships: newInternships });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={internship.company}
                                                    onChange={(e) => {
                                                        const newInternships = [...editingUser.internships];
                                                        newInternships[index].company = e.target.value;
                                                        setEditingUser({ ...editingUser, internships: newInternships });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Company"
                                                />
                                            </div>
                                            <textarea
                                                value={internship.description}
                                                onChange={(e) => {
                                                    const newInternships = [...editingUser.internships];
                                                    newInternships[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, internships: newInternships });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newInternships = editingUser.internships.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, internships: newInternships });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Internship
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newInternships = [...(editingUser.internships || []), { title: "New Internship", company: "New Company", description: "", startDate: new Date(), current: true }];
                                            setEditingUser({ ...editingUser, internships: newInternships });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Internship
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Awards */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Awards</h4>
                                <div className="space-y-4">
                                    {editingUser.awards && editingUser.awards.map((award, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={award.title}
                                                    onChange={(e) => {
                                                        const newAwards = [...editingUser.awards];
                                                        newAwards[index].title = e.target.value;
                                                        setEditingUser({ ...editingUser, awards: newAwards });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Title"
                                                />
                                                <input
                                                    type="text"
                                                    value={award.issuer}
                                                    onChange={(e) => {
                                                        const newAwards = [...editingUser.awards];
                                                        newAwards[index].issuer = e.target.value;
                                                        setEditingUser({ ...editingUser, awards: newAwards });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Issuer"
                                                />
                                            </div>
                                            <textarea
                                                value={award.description}
                                                onChange={(e) => {
                                                    const newAwards = [...editingUser.awards];
                                                    newAwards[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, awards: newAwards });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none"
                                                placeholder="Description"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newAwards = editingUser.awards.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, awards: newAwards });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Award
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newAwards = [...(editingUser.awards || []), { title: "New Award", issuer: "Issuer", description: "", date: new Date() }];
                                            setEditingUser({ ...editingUser, awards: newAwards });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Award
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Certifications */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Certifications</h4>
                                <div className="space-y-4">
                                    {editingUser.certifications && editingUser.certifications.map((cert, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-4 mb-2">
                                                <input
                                                    type="text"
                                                    value={cert.name}
                                                    onChange={(e) => {
                                                        const newCerts = [...editingUser.certifications];
                                                        newCerts[index].name = e.target.value;
                                                        setEditingUser({ ...editingUser, certifications: newCerts });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Name"
                                                />
                                                <input
                                                    type="text"
                                                    value={cert.issuer}
                                                    onChange={(e) => {
                                                        const newCerts = [...editingUser.certifications];
                                                        newCerts[index].issuer = e.target.value;
                                                        setEditingUser({ ...editingUser, certifications: newCerts });
                                                    }}
                                                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="Issuer"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newCerts = editingUser.certifications.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, certifications: newCerts });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Certification
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newCerts = [...(editingUser.certifications || []), { name: "New Certification", issuer: "Issuer", issueDate: new Date() }];
                                            setEditingUser({ ...editingUser, certifications: newCerts });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Certification
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Projects */}
                        {editingUser.role === "graduate" && (
                            <div className="border-t border-gray-100 pt-6 mt-6">
                                <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Projects</h4>
                                <div className="space-y-4">
                                    {editingUser.projects && editingUser.projects.map((proj, index) => (
                                        <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="mb-2">
                                                <input
                                                    type="text"
                                                    value={proj.name}
                                                    onChange={(e) => {
                                                        const newProjects = [...editingUser.projects];
                                                        newProjects[index].name = e.target.value;
                                                        setEditingUser({ ...editingUser, projects: newProjects });
                                                    }}
                                                    className="w-full px-3 py-1 border border-gray-300 rounded text-sm font-bold"
                                                    placeholder="Project Name"
                                                />
                                            </div>
                                            <textarea
                                                value={proj.description}
                                                onChange={(e) => {
                                                    const newProjects = [...editingUser.projects];
                                                    newProjects[index].description = e.target.value;
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-20 resize-none mb-2"
                                                placeholder="Description"
                                            />
                                            <input
                                                type="text"
                                                value={proj.url}
                                                onChange={(e) => {
                                                    const newProjects = [...editingUser.projects];
                                                    newProjects[index].url = e.target.value;
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm mb-2"
                                                placeholder="Project URL"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newProjects = editingUser.projects.filter((_, i) => i !== index);
                                                    setEditingUser({ ...editingUser, projects: newProjects });
                                                }}
                                                className="text-xs text-red-600 hover:text-red-800 mt-2 underline"
                                            >
                                                Remove Project
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newProjects = [...(editingUser.projects || []), { name: "New Project", description: "", url: "", startDate: new Date() }];
                                            setEditingUser({ ...editingUser, projects: newProjects });
                                        }}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        + Add Project
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Employer Specific */}
                        {editingUser.role === "employer" && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Company Information</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.companyName || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, companyName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={editingUser.companyDescription || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, companyDescription: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-32 resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
                            >
                                {editingUser?._id ? "Save Changes" : "Create User"}
                            </button>
                        </div>
                    </form>
                )
                }
            </AdminModal >

            {/* Saved Jobs Modal */}
            < AdminModal
                isOpen={showSavedJobsModal}
                onClose={() => setShowSavedJobsModal(false)}
                title={`Saved Jobs for ${selectedUser?.fullName}`}
                maxWidth="max-w-2xl"
            >
                {
                    savedJobs.length > 0 ? (
                        <div className="space-y-4">
                            {savedJobs.map((savedJob) => (
                                <div key={savedJob._id} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900">{savedJob.job?.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-gray-600">{savedJob.job?.company?.companyName}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span className="text-sm text-gray-500">
                                                    Saved on {new Date(savedJob.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${!savedJob.job?.isClosed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {!savedJob.job?.isClosed ? "Active" : "Closed"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">No saved jobs found for this user.</p>
                        </div>
                    )
                }
            </AdminModal >

            {/* View User Modal */}
            < AdminModal
                isOpen={showViewModal}
                onClose={() => setShowViewModal(false)}
                title="User Details"
                maxWidth="max-w-2xl"
            >
                {viewingUser && (
                    <div className="space-y-8">
                        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100">
                            <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center overflow-hidden border-4 border-white">
                                {viewingUser.avatar ? (
                                    <img src={viewingUser.avatar} alt={viewingUser.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl text-gray-400 font-bold">{viewingUser.fullName.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{viewingUser.fullName}</h3>
                                <p className="text-gray-500 font-medium">{viewingUser.email}</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${viewingUser.role === "employer"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-blue-100 text-blue-700"
                                            }`}
                                    >
                                        {viewingUser.role}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        Joined {new Date(viewingUser.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone</h4>
                                <p className="text-gray-900 font-medium">{viewingUser.phone || "Not provided"}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</h4>
                                <p className="text-gray-900 font-medium">{viewingUser.address || "Not provided"}</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Website</h4>
                                <p className="text-gray-900 font-medium truncate">
                                    {viewingUser.website ? (
                                        <a href={viewingUser.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                            {viewingUser.website}
                                        </a>
                                    ) : "Not provided"}
                                </p>
                            </div>
                        </div>

                        {viewingUser.role === "graduate" && (
                            <>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                        Education
                                    </h4>
                                    {viewingUser.education && viewingUser.education.length > 0 ? (
                                        <div className="space-y-3">
                                            {viewingUser.education.map((edu, index) => (
                                                <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">School</h5>
                                                            <p className="text-gray-900 font-medium">{edu.school || "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Degree</h5>
                                                            <p className="text-gray-900 font-medium">{edu.degree || "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Start Date</h5>
                                                            <p className="text-gray-900">{edu.startDate ? new Date(edu.startDate).toLocaleDateString() : "N/A"}</p>
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">End Date</h5>
                                                            <p className="text-gray-900">{edu.endDate ? new Date(edu.endDate).toLocaleDateString() : "N/A"}</p>
                                                        </div>
                                                        {edu.location && (
                                                            <div className="col-span-2">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Location</h5>
                                                                <p className="text-gray-900">{edu.location}</p>
                                                            </div>
                                                        )}
                                                        {edu.activities && (
                                                            <div className="col-span-2">
                                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Activities</h5>
                                                                <p className="text-gray-700 text-sm">{edu.activities}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-center">
                                            <p className="text-gray-500 italic">No education entries</p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                        Professional
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">LinkedIn</h5>
                                            <p className="text-gray-900 font-medium truncate">{viewingUser.linkedin || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GitHub</h5>
                                            <p className="text-gray-900 font-medium truncate">{viewingUser.github || "N/A"}</p>
                                        </div>
                                        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Portfolio</h5>
                                            <p className="text-gray-900 font-medium truncate">{viewingUser.portfolio || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {viewingUser.role === "employer" && (
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                    Company Details
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Name</h5>
                                        <p className="text-gray-900 font-medium">{viewingUser.companyName || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h5>
                                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingUser.companyDescription || "N/A"}</p>
                                    </div>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Business Permit</h5>
                                        {viewingUser.businessPermit ? (
                                            <a
                                                href={viewingUser.businessPermit}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium mt-2"
                                            >
                                                View Permit Document
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 italic">No business permit uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewingUser.role === "graduate" && (
                            <>
                                {/* Skills */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-indigo-600 rounded-full"></span>
                                        Skills & Expertise
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingUser.skills && viewingUser.skills.length > 0 ? (
                                            viewingUser.skills.map((skill, index) => (
                                                <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No skills listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Languages */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-yellow-600 rounded-full"></span>
                                        Languages
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingUser.languages && viewingUser.languages.length > 0 ? (
                                            viewingUser.languages.map((lang, index) => (
                                                <span key={index} className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                                                    {lang.language} ({lang.proficiency})
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No languages listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Experience */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                                        Experience
                                    </h4>
                                    <div className="space-y-4">
                                        {viewingUser.experiences && viewingUser.experiences.length > 0 ? (
                                            viewingUser.experiences.map((exp, index) => (
                                                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{exp.title}</h5>
                                                            <p className="text-gray-600 font-medium">{exp.company}</p>
                                                        </div>
                                                        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                            {new Date(exp.startDate).toLocaleDateString()} - {exp.current ? "Present" : new Date(exp.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{exp.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No experience listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Internships */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-pink-600 rounded-full"></span>
                                        Internships
                                    </h4>
                                    <div className="space-y-4">
                                        {viewingUser.internships && viewingUser.internships.length > 0 ? (
                                            viewingUser.internships.map((internship, index) => (
                                                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h5 className="font-bold text-gray-900">{internship.title}</h5>
                                                            <p className="text-gray-600 font-medium">{internship.company}</p>
                                                        </div>
                                                        <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                            {new Date(internship.startDate).toLocaleDateString()} - {internship.current ? "Present" : new Date(internship.endDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{internship.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No internships listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Awards */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-purple-600 rounded-full"></span>
                                        Awards
                                    </h4>
                                    <div className="space-y-4">
                                        {viewingUser.awards && viewingUser.awards.length > 0 ? (
                                            viewingUser.awards.map((award, index) => (
                                                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <h5 className="font-bold text-gray-900">{award.title}</h5>
                                                    <p className="text-gray-600 font-medium text-sm">{award.issuer} • {new Date(award.date).toLocaleDateString()}</p>
                                                    <p className="text-gray-700 text-sm mt-2">{award.description}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No awards listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Certifications */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                        Certifications
                                    </h4>
                                    <div className="space-y-4">
                                        {viewingUser.certifications && viewingUser.certifications.length > 0 ? (
                                            viewingUser.certifications.map((cert, index) => (
                                                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <h5 className="font-bold text-gray-900">{cert.name}</h5>
                                                    <p className="text-gray-600 font-medium text-sm">{cert.issuer} • {new Date(cert.issueDate).toLocaleDateString()}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No certifications listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Projects */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                        Projects
                                    </h4>
                                    <div className="space-y-4">
                                        {viewingUser.projects && viewingUser.projects.length > 0 ? (
                                            viewingUser.projects.map((proj, index) => (
                                                <div key={index} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                    <h5 className="font-bold text-gray-900">{proj.name}</h5>
                                                    <p className="text-gray-700 text-sm mt-1 mb-2">{proj.description}</p>
                                                    {proj.url && (
                                                        <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                                            View Project
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic">No projects listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Job Preferences */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-teal-600 rounded-full"></span>
                                        Job Preferences
                                    </h4>
                                    {viewingUser.jobPreferences ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Desired Title</h5>
                                                <p className="text-gray-900 font-medium">{viewingUser.jobPreferences.desiredJobTitle || "N/A"}</p>
                                            </div>
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Industry</h5>
                                                <p className="text-gray-900 font-medium">{viewingUser.jobPreferences.industry || "N/A"}</p>
                                            </div>
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Preferred Location</h5>
                                                <p className="text-gray-900 font-medium">{viewingUser.jobPreferences.preferredLocation || "N/A"}</p>
                                            </div>
                                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Job Type</h5>
                                                <p className="text-gray-900 font-medium">{viewingUser.jobPreferences.jobType || "N/A"}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No preferences set</p>
                                    )}
                                </div>

                                {/* Resume */}
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-red-600 rounded-full"></span>
                                        Resume
                                    </h4>
                                    <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                        {viewingUser.resume ? (
                                            <a
                                                href={viewingUser.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium"
                                            >
                                                View Resume
                                            </a>
                                        ) : (
                                            <p className="text-gray-500 italic">No resume uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </AdminModal >
        </DashboardLayout >
    );
};

export default AdminUsers;
