
import React from 'react';
import { Eye, EyeOff, Upload, File, Loader } from 'lucide-react';


const UserProfileImage = ({ editingUser, imageUploading, handleImageUpload }) => {
    return (
        <>
                        {/* Profile Image Upload */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">
                                {(editingUser.role === "graduate" || editingUser.role === "jobseeker") ? "Profile Picture" : "Company Logo"}
                            </h3>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                                    {((editingUser.role === "graduate" || editingUser.role === "jobseeker") ? editingUser.avatar : editingUser.companyLogo) ? (
                                        <img
                                            src={(editingUser.role === "graduate" || editingUser.role === "jobseeker") ? editingUser.avatar : editingUser.companyLogo}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center px-2">No image</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {(editingUser.role === "graduate" || editingUser.role === "jobseeker") ? "Upload Avatar" : "Upload Company Logo"}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, (editingUser.role === "graduate" || editingUser.role === "jobseeker") ? "avatar" : "companyLogo")}
                                        disabled={imageUploading}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                    />
                                    {imageUploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                                </div>
                            </div>
                        </div>

        </>
    );
};

export default UserProfileImage;
