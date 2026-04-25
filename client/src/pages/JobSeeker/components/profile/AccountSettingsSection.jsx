import React from 'react';
import { Settings, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountSettingsSection = ({ setDeleteModalOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
    };

    return (
        <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-6 h-6 mr-3 text-gray-600" />
                Account Settings
            </h3>
            <div className="space-y-4">
                <button
                    onClick={handleLogout}
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
        </div>
    );
};

export default AccountSettingsSection;
