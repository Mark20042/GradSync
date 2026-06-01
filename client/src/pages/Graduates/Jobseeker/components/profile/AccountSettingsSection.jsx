import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Trash2, Lock, X, Eye, EyeOff, Key, Clock, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import ChangePasswordModal from '../../../../../components/ChangePasswordModal';
import { useAuth } from '../../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../../../../utils/axiosInstance';
import { API_PATH } from '../../../../../utils/apiPath';

const AccountSettingsSection = ({ setDeleteModalOpen }) => {
    const { user, logout } = useAuth();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-gray-600" />
                Account Settings
            </h3>
            <div className="space-y-4">
                <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                >
                    <span className="font-medium">Change Password</span>
                    <Lock className="w-5 h-5" />
                </button>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
                >
                    <span className="font-medium">Log Out</span>
                    <LogOut className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="w-full flex items-center justify-between p-4 bg-red-50 rounded-xl hover:bg-red-100 text-red-600 transition-colors"
                >
                    <span className="font-medium">Delete Account</span>
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <AnimatePresence>
                {isPasswordModalOpen && (
                    <ChangePasswordModal 
                        isOpen={isPasswordModalOpen} 
                        onClose={() => setIsPasswordModalOpen(false)} 
                        userEmail={user?.email}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default AccountSettingsSection;
