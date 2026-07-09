import React from 'react';
import { Eye, EyeOff, Upload, File, Loader } from 'lucide-react';


const UserBasicInfo = ({ editingUser, setEditingUser, showPassword, setShowPassword }) => {
    return (
        <>
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                    <input
                                        type="text"
                                        value={editingUser.firstName || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                    <input
                                        type="text"
                                        value={editingUser.middleName || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, middleName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                    <input
                                        type="text"
                                        value={editingUser.lastName || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={editingUser.email || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {editingUser._id ? "New Password (Leave blank to keep current)" : "Password *"}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={editingUser.password || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                                            required={!editingUser._id}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        value={editingUser.role || "jobseeker"}
                                        onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    >
                                        <option value="graduate">Graduate</option>
                                        <option value="jobseeker">Job Seeker</option>
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
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={editingUser.address || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, address: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                    <input
                                        type="text"
                                        value={editingUser.website || ""}
                                        onChange={(e) => setEditingUser({ ...editingUser, website: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                {!editingUser.isAdmin && (
                                    <div className="md:col-span-2 flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="manual-verify"
                                            checked={editingUser.verified || false}
                                            onChange={(e) => setEditingUser({ ...editingUser, verified: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="manual-verify" className="text-sm font-bold text-gray-900">
                                            Manually Verified
                                        </label>
                                        <p className="text-xs text-gray-500 ml-2">(Bypasses automated OCR check)</p>
                                    </div>
                                )}
                            </div>
                        </div>

        </>
    );
};

export default UserBasicInfo;
