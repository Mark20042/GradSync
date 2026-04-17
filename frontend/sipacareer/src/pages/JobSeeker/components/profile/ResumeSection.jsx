import React from 'react';
import { Download, Upload, Trash2, FileText } from 'lucide-react';

const ResumeSection = ({ user, editing, editData, downloadResume, handleResumeUpload, handleDeleteResume }) => {
    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-blue-600" />
                Resume
            </h3>

            <div className="space-y-4">
                {(editing ? editData.resume : user.resume) ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={downloadResume}
                            className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all"
                        >
                            <Download className="w-5 h-5 mr-2" />
                            Download Resume
                        </button>
                        {editing && (
                            <>
                                <label className="flex-1 flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all cursor-pointer">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Update Resume
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleResumeUpload}
                                    />
                                </label>
                                <button
                                    onClick={handleDeleteResume}
                                    className="flex-1 flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
                                >
                                    <Trash2 className="w-5 h-5 mr-2" />
                                    Delete Resume
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                        {editing ? (
                            <label className="cursor-pointer">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Click to upload your resume</p>
                                <p className="text-sm text-gray-500 mt-1">
                                    PDF, DOC, DOCX (Max 5MB)
                                </p>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleResumeUpload}
                                />
                            </label>
                        ) : (
                            <p className="text-gray-500">No resume uploaded</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResumeSection;
