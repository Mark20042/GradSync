import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Trash2, Search, Shield, Edit, Eye, EyeOff, Plus, X, FileText, CheckCircle, AlertCircle, BrainCircuit } from "lucide-react";
import toast from "react-hot-toast";
import AdminModal from "./components/AdminModal";
import UserBasicInfo from "./components/UserForm/UserBasicInfo";
import UserProfileImage from "./components/UserForm/UserProfileImage";
import UserGraduateInfo from "./components/UserForm/UserGraduateInfo";
import UserEmployerInfo from "./components/UserForm/UserEmployerInfo";
import { Degrees } from "../../utils/data";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [editingUser, setEditingUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [viewingUser, setViewingUser] = useState(null);
    const [showAIReviewModal, setShowAIReviewModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [savedJobs, setSavedJobs] = useState([]);
    const [showSavedJobsModal, setShowSavedJobsModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [imageUploading, setImageUploading] = useState(false);
    const [showPermitModal, setShowPermitModal] = useState(false);
    const [selectedPermitUrl, setSelectedPermitUrl] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [degreeSearchTerm, setDegreeSearchTerm] = useState("");
    const [showDegreeDropdown, setShowDegreeDropdown] = useState(false);
    const degreeDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (degreeDropdownRef.current && !degreeDropdownRef.current.contains(event.target)) {
                setShowDegreeDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        fetchUsers();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchUsers, 30000);

        // Re-fetch when tab becomes visible
        const handleVisibility = () => {
            if (document.visibilityState === "visible") fetchUsers();
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
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

    const handleDelete = async () => {
        if (!userToDelete) return;
        try {
            await axiosInstance.delete(API_PATH.ADMIN.DELETE_USER(userToDelete));
            setUsers(users.filter((user) => user._id !== userToDelete));
            toast.success("User deleted successfully");
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        } finally {
            setShowDeleteModal(false);
            setUserToDelete(null);
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
            universityAddress: "",
            degree: "",
            major: "",
            graduationYear: "",
            linkedin: "",
            github: "",
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
                                                        loading="lazy"
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
                                        <div className="flex flex-col gap-1.5">
                                            {user.isAdmin ? (
                                                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wide bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 w-fit">
                                                    <Shield className="w-3.5 h-3.5" /> Admin
                                                </span>
                                            ) : (
                                                <span className="text-gray-400 text-sm font-medium">User</span>
                                            )}
                                            {!user.isAdmin && (
                                                <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide w-fit ${user.verified 
                                                    ? "bg-green-50 text-green-600 border-green-100" 
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                                }`}>
                                                    {user.verified ? (
                                                        <><CheckCircle className="w-3.5 h-3.5" /> Verified</>
                                                    ) : (
                                                        <><AlertCircle className="w-3.5 h-3.5" /> Unverified</>
                                                    )}
                                                </span>
                                            )}
                                        </div>
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
                                            {(user.role === "graduate" || user.role === "jobseeker") && (
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
                                                    onClick={() => {
                                                        setUserToDelete(user._id);
                                                        setShowDeleteModal(true);
                                                    }}
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
                maxWidth="max-w-4xl"
            >
                {editingUser && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <UserBasicInfo editingUser={editingUser} setEditingUser={setEditingUser} showPassword={showPassword} setShowPassword={setShowPassword} />
                        <UserProfileImage editingUser={editingUser} imageUploading={imageUploading} handleImageUpload={handleImageUpload} />
                        <UserGraduateInfo 
                            editingUser={editingUser} 
                            setEditingUser={setEditingUser} 
                            degreeSearchTerm={degreeSearchTerm} 
                            setDegreeSearchTerm={setDegreeSearchTerm} 
                            showDegreeDropdown={showDegreeDropdown} 
                            setShowDegreeDropdown={setShowDegreeDropdown} 
                            degreeDropdownRef={degreeDropdownRef} 
                        />
                        <UserEmployerInfo editingUser={editingUser} setEditingUser={setEditingUser} />
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
            </AdminModal>

            {/* View User Modal */}
            <AdminModal
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

                        {(viewingUser.role === "graduate" || viewingUser.role === "jobseeker") && (
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
                                            <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Website</h5>
                                            <p className="text-gray-900 font-medium truncate">{viewingUser.website || "N/A"}</p>
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
                                        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Business Permit</h5>
                                        {viewingUser.businessPermit ? (
                                            <div className="space-y-3">
                                                {/* Image Preview */}
                                                {viewingUser.businessPermit.toLowerCase().endsWith('.pdf') ? (
                                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                        <FileText className="w-12 h-12 text-red-500" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">PDF Document</p>
                                                            <p className="text-sm text-gray-500">Click below to view</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200"
                                                        onClick={() => {
                                                            setSelectedPermitUrl(viewingUser.businessPermit);
                                                            setShowPermitModal(true);
                                                        }}
                                                    >
                                                        <img
                                                            src={viewingUser.businessPermit}
                                                            alt="Business Permit"
                                                            className="w-full h-48 object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-white font-medium flex items-center gap-2">
                                                                <Eye className="w-5 h-5" />
                                                                Click to Expand
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedPermitUrl(viewingUser.businessPermit);
                                                            setShowPermitModal(true);
                                                        }}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Full Size
                                                    </button>
                                                    <a
                                                        href={viewingUser.businessPermit}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                                    >
                                                        Open in New Tab
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic">No business permit uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {(viewingUser.role === "graduate" || viewingUser.role === "jobseeker") && (
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

            {/* Business Permit Preview Modal */}
            {showPermitModal && selectedPermitUrl && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Business Permit Document
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPermitModal(false);
                                    setSelectedPermitUrl(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 overflow-auto max-h-[70vh] bg-gray-50">
                            {selectedPermitUrl.toLowerCase().endsWith('.pdf') ? (
                                <iframe
                                    src={selectedPermitUrl}
                                    className="w-full h-[60vh] border-0 rounded-lg"
                                    title="Business Permit PDF"
                                />
                            ) : (
                                <img
                                    src={selectedPermitUrl}
                                    alt="Business Permit"
                                    className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                                />
                            )}
                        </div>
                        <div className="flex justify-end gap-3 p-4 border-t bg-white">
                            <a
                                href={selectedPermitUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition font-medium"
                            >
                                Open in New Tab
                            </a>
                            <button
                                onClick={() => {
                                    setShowPermitModal(false);
                                    setSelectedPermitUrl(null);
                                }}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden p-6 text-center transform transition-all">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                        <p className="text-gray-500 text-sm mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout >
    );
};

export default AdminUsers;
