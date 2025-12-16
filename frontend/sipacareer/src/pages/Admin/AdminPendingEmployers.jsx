import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import { CheckCircle, XCircle, Eye, Building2, Mail, Calendar, FileText, X } from "lucide-react";
import toast from "react-hot-toast";

// Business Permit Preview Modal
const PermitPreviewModal = ({ isOpen, onClose, permitUrl, employerName }) => {
    if (!isOpen) return null;

    const isPdf = permitUrl?.toLowerCase().endsWith(".pdf");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Business Permit - {employerName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4 max-h-[70vh] overflow-auto">
                    {isPdf ? (
                        <iframe
                            src={permitUrl}
                            className="w-full h-[60vh] border rounded-lg"
                            title="Business Permit"
                        />
                    ) : (
                        <img
                            src={permitUrl}
                            alt="Business Permit"
                            className="w-full max-h-[60vh] object-contain rounded-lg"
                        />
                    )}
                </div>
                <div className="flex justify-end p-4 border-t">
                    <a
                        href={permitUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition font-medium"
                    >
                        Open in New Tab
                    </a>
                </div>
            </div>
        </div>
    );
};

// Rejection Reason Modal
const RejectModal = ({ isOpen, onClose, onConfirm, employerName }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Reject {employerName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Please provide a reason for rejection (optional):
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Business permit is unclear, invalid document..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none h-24"
                />
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

// Approval Confirmation Modal
const ApprovalModal = ({ isOpen, onClose, onConfirm, employer }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Approve {employer?.companyName}?
                    </h3>
                    <p className="text-gray-600 text-sm">
                        This employer will be granted full access to the platform and will receive an approval notification email.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Company:</span>
                        <span className="font-semibold text-gray-900">{employer?.companyName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Contact Person:</span>
                        <span className="font-semibold text-gray-900">{employer?.fullName}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-semibold text-gray-900">{employer?.email}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminPendingEmployers = () => {
    const [pendingEmployers, setPendingEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPermit, setSelectedPermit] = useState(null);
    const [rejectingEmployer, setRejectingEmployer] = useState(null);
    const [approvingEmployer, setApprovingEmployer] = useState(null);

    useEffect(() => {
        fetchPendingEmployers();
    }, []);

    const fetchPendingEmployers = async () => {
        try {
            const response = await axiosInstance.get(API_PATH.ADMIN.PENDING_EMPLOYERS);
            setPendingEmployers(response.data);
        } catch (error) {
            console.error("Error fetching pending employers:", error);
            toast.error("Failed to fetch pending employers");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!approvingEmployer) return;

        try {
            await axiosInstance.put(API_PATH.ADMIN.APPROVE_EMPLOYER(approvingEmployer._id));
            setPendingEmployers(pendingEmployers.filter((e) => e._id !== approvingEmployer._id));
            toast.success(
                `${approvingEmployer.companyName} approved! An approval email has been sent to ${approvingEmployer.email}`,
                { duration: 5000 }
            );
            setApprovingEmployer(null);
        } catch (error) {
            console.error("Error approving employer:", error);
            toast.error("Failed to approve employer");
        }
    };

    const handleReject = async (reason) => {
        if (!rejectingEmployer) return;

        try {
            await axiosInstance.put(API_PATH.ADMIN.REJECT_EMPLOYER(rejectingEmployer._id), { reason });
            setPendingEmployers(pendingEmployers.filter((e) => e._id !== rejectingEmployer._id));
            toast.success(
                `${rejectingEmployer.companyName} rejected. A notification email has been sent.`,
                { duration: 5000 }
            );
            setRejectingEmployer(null);
        } catch (error) {
            console.error("Error rejecting employer:", error);
            toast.error("Failed to reject employer");
        }
    };

    if (loading) {
        return (
            <DashboardLayout activeMenu="admin-pending-employers">
                <LoadingSpinner />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="admin-pending-employers">
            <div className="p-6 w-full">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pending Employer Approvals</h1>
                        <p className="text-gray-500 mt-1">
                            Review and approve new employer registrations
                        </p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full font-semibold">
                        {pendingEmployers.length} Pending
                    </div>
                </div>

                {pendingEmployers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-500">No pending employer applications at the moment.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pendingEmployers.map((employer) => (
                            <div
                                key={employer._id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center overflow-hidden">
                                            {employer.avatar ? (
                                                <img
                                                    src={employer.avatar}
                                                    alt={employer.companyName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-purple-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {employer.companyName}
                                            </h3>
                                            <p className="text-gray-600">{employer.fullName}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {employer.email}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Applied {new Date(employer.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {employer.businessPermit && (
                                            <button
                                                onClick={() => setSelectedPermit(employer)}
                                                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View Permit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setRejectingEmployer(employer)}
                                            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => setApprovingEmployer(employer)}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </button>
                                    </div>
                                </div>

                                {!employer.businessPermit && (
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                                        ⚠️ No business permit uploaded
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Permit Preview Modal */}
            <PermitPreviewModal
                isOpen={!!selectedPermit}
                onClose={() => setSelectedPermit(null)}
                permitUrl={selectedPermit?.businessPermit}
                employerName={selectedPermit?.companyName}
            />

            {/* Approval Modal */}
            <ApprovalModal
                isOpen={!!approvingEmployer}
                onClose={() => setApprovingEmployer(null)}
                onConfirm={handleApprove}
                employer={approvingEmployer}
            />

            {/* Reject Modal */}
            <RejectModal
                isOpen={!!rejectingEmployer}
                onClose={() => setRejectingEmployer(null)}
                onConfirm={handleReject}
                employerName={rejectingEmployer?.companyName}
            />
        </DashboardLayout>
    );
};

export default AdminPendingEmployers;
