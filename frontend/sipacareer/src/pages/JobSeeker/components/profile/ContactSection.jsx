import React from 'react';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

const ContactSection = ({ user, editing, editData, handleEditChange }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <User className="w-6 h-6 mr-3 text-blue-600" />
                Contact Information
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <Mail className="w-5 h-5 text-blue-500 mt-1" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Email</label>
                            {editing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editData.email || ""}
                                    onChange={handleEditChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{user.email}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                        <Phone className="w-5 h-5 text-green-500 mt-1" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Phone</label>
                            {editing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editData.phone || ""}
                                    onChange={handleEditChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{user.phone || "Not provided"}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                        <MapPin className="w-5 h-5 text-red-500 mt-1" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Address</label>
                            {editing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={editData.address || ""}
                                    onChange={handleEditChange}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                />
                            ) : (
                                <p className="font-medium text-gray-800">{user.address || "Not provided"}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <Globe className="w-5 h-5 text-purple-500 mt-1" />
                        <div className="flex-1">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Website</label>
                            {editing ? (
                                <input
                                    type="url"
                                    name="website"
                                    value={editData.website || ""}
                                    onChange={handleEditChange}
                                    placeholder="https://yourwebsite.com"
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                                />
                            ) : user.website ? (
                                <a
                                    href={user.website}
                                    className="text-blue-600 hover:underline font-medium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {user.website}
                                </a>
                            ) : (
                                <p className="text-gray-500">Not provided</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-3">Social Profiles</label>
                {editing ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <Linkedin className="w-5 h-5 text-blue-600" />
                            <input
                                type="url"
                                name="linkedin"
                                value={editData.linkedin || ""}
                                onChange={handleEditChange}
                                placeholder="LinkedIn URL"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Github className="w-5 h-5 text-gray-800" />
                            <input
                                type="url"
                                name="github"
                                value={editData.github || ""}
                                onChange={handleEditChange}
                                placeholder="GitHub URL"
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        {user.linkedin && (
                            <a
                                href={user.linkedin}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Linkedin className="w-5 h-5" />
                                LinkedIn
                            </a>
                        )}
                        {user.github && (
                            <a
                                href={user.github}
                                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="w-5 h-5" />
                                GitHub
                            </a>
                        )}
                        {!user.linkedin && !user.github && (
                            <p className="text-gray-500 text-sm">No social profiles added</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactSection;
