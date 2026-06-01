import React, { useState, useEffect } from 'react';
import { Settings, LogOut, Trash2, Lock, X, Eye, EyeOff, Key, Clock, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../../../../utils/axiosInstance';
import { API_PATH } from '../../../../../utils/apiPath';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const ChangePasswordModal = ({ isOpen, onClose, userEmail }) => {
    const [mode, setMode] = useState("CHANGE"); // "CHANGE" | "OTP"
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        let timerId;
        if (mode === "OTP" && timeLeft > 0) {
            timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timerId);
    }, [mode, timeLeft]);

    const resetState = () => {
        setMode("CHANGE");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setError("");
        setSuccessMsg("");
        setTimeLeft(0);
        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);
    };

    useEffect(() => {
        if (!isOpen) resetState();
    }, [isOpen]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMsg("");

        try {
            const res = await axiosInstance.post(API_PATH.AUTH.CHANGE_PASSWORD, {
                oldPassword,
                newPassword,
            });
            setSuccessMsg(res.data.message || "Password updated successfully!");
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        setLoading(true);
        setError("");
        setSuccessMsg("");

        try {
            const res = await axiosInstance.post(API_PATH.AUTH.FORGOT_PASSWORD, {
                email: userEmail,
            });
            setSuccessMsg(res.data.message || "OTP sent to your email!");
            setMode("OTP");
            setTimeLeft(300);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!otp) {
            setError("OTP is required.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        setError("");
        setSuccessMsg("");

        try {
            const res = await axiosInstance.post(API_PATH.AUTH.RESET_PASSWORD, {
                email: userEmail,
                otp,
                newPassword,
            });
            setSuccessMsg(res.data.message || "Password reset successfully!");
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password. Invalid or expired OTP.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {mode === "CHANGE" ? "Enter your current password to set a new one." : "Enter the OTP sent to your email."}
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 rounded flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <p className="text-sm text-green-700">{successMsg}</p>
                    </div>
                )}

                {mode === "CHANGE" && (
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showOld ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Current password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showOld ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showNew ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showNew ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (successMsg && !successMsg.includes("sent"))}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm font-medium mt-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Update Password"}
                        </button>
                    </form>
                )}

                {mode === "OTP" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">OTP Code</label>
                                <div className="flex items-center space-x-2 text-xs">
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-500">Expires in: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span></span>
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        disabled={timeLeft > 0 || loading}
                                        className={`font-medium transition ml-1 ${timeLeft > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-700 hover:underline"}`}
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </div>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm tracking-widest"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showNew ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showNew ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showConfirm ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || (successMsg && !successMsg.includes("sent"))}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-70 text-sm font-medium mt-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : "Reset Password"}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

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
