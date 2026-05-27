
import React from 'react';
import { Eye, EyeOff, Upload, File, Loader } from 'lucide-react';


const UserEmployerInfo = ({ editingUser, setEditingUser }) => {
    return (
        <>
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

        </>
    );
};

export default UserEmployerInfo;
