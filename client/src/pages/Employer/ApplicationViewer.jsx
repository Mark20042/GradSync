import { useState, useEffect, useMemo, useRef } from "react";
import {
  Users,
  MapPin,
  Briefcase,
  ArrowLeft,
  Download,
  Calendar,
  Eye,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  FileText,
  Pencil,
  X,
  LayoutGrid,
  LogOut,
  CalendarX,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getInitials } from "../../utils/helper";
import moment from "moment";
import toast from "react-hot-toast";
import StatusBadge from "./../../components/StatusBadge";
import ApplicantProfilePreview from "./components/ApplicantProfilePreview";
import Breadcrumbs from "../../components/Breadcrumbs";

const ApplicationViewer = () => {
  const location = useLocation();
  const stateJobId = location.state?.jobId || null;
  const stateAppId = location.state?.applicationId || null;
  const hasAutoOpened = useRef(false);

  const navigate = useNavigate();

  const [jobId, setJobId] = useState(stateJobId);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [contracts, setContracts] = useState({});
  const [showExtendModal, setShowExtendModal] = useState(null);
  const [confirmEndContract, setConfirmEndContract] = useState(null);
  const [extendForm, setExtendForm] = useState({ duration: 6, durationUnit: "months", reason: "" });
  const [rejectResignationModal, setRejectResignationModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [terminationEndDate, setTerminationEndDate] = useState(new Date().toISOString().split("T")[0]);

  const fetchApplications = async (jId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_PATH.APPLICATIONS.GET_ALL_APPLICATIONS(jId)
      );
      setApplications(response.data);
      if (stateAppId && !hasAutoOpened.current) {
        const targetApp = response.data.find(a => a._id === stateAppId);
        if (targetApp) {
          setSelectedApplicant(targetApp);
          hasAutoOpened.current = true;
        }
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (stateAppId) {
        try {
          setLoading(true);
          const res = await axiosInstance.get(API_PATH.APPLICATIONS.GET_APPLICATION_BY_ID(stateAppId));
          if (res.data && res.data.job) {
            const jId = res.data.job._id || res.data.job;
            setJobId(jId);
            fetchApplications(jId);
          } else {
            navigate("/manage-jobs");
          }
        } catch (err) {
          navigate("/manage-jobs");
        }
      } else if (stateJobId) {
        setJobId(stateJobId);
        fetchApplications(stateJobId);
      } else if (jobId) {
        fetchApplications(jobId);
      } else {
        navigate("/manage-jobs");
      }
    };
    init();
  }, [stateJobId, stateAppId, navigate]);

  // Fetch contracts for accepted applicants
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const res = await axiosInstance.get(API_PATH.CONTRACTS.GET_ALL);
        const map = {};
        res.data.forEach((c) => {
          map[`${c.employee?._id || c.employee}_${c.job?._id || c.job}`] = c;
        });
        setContracts(map);
      } catch (_) { }
    };
    if (applications.length > 0) fetchContracts();
  }, [applications]);

  const handleExtendContract = async () => {
    if (!showExtendModal) return;
    try {
      await axiosInstance.patch(API_PATH.CONTRACTS.EXTEND(showExtendModal._id), {
        duration: extendForm.duration,
        durationUnit: extendForm.durationUnit,
        reason: extendForm.reason,
      });
      toast.success("Contract extended!");
      const res = await axiosInstance.get(API_PATH.CONTRACTS.GET_ALL);
      const map = {};
      res.data.forEach((c) => { map[`${c.employee?._id || c.employee}_${c.job?._id || c.job}`] = c; });
      setContracts(map);
      setShowExtendModal(null);
      setExtendForm({ duration: 6, durationUnit: "months", reason: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Extension failed");
    }
  };

  const handleReviewResignation = async (appId, status, reason = "") => {
    try {
      if (status === 'Rejected' && !reason && rejectResignationModal !== appId) {
        setRejectResignationModal(appId);
        setRejectReason("");
        return;
      }

      await axiosInstance.post(API_PATH.APPLICATIONS.REVIEW_RESIGNATION(appId), {
        status,
        rejectedReason: reason
      });
      toast.success(`Resignation request ${status.toLowerCase()}`);
      if (jobId) fetchApplications(jobId);
      const res = await axiosInstance.get(API_PATH.CONTRACTS.GET_ALL);
      const map = {};
      res.data.forEach((c) => { map[`${c.employee?._id || c.employee}_${c.job?._id || c.job}`] = c; });
      setContracts(map);
      setRejectResignationModal(null);
      setRejectReason("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process request");
    }
  };

  const handleEndContractStatus = (contractId, status, applicantName) => {
    setTerminationEndDate(new Date().toISOString().split("T")[0]);
    setConfirmEndContract({ contractId, status, applicantName });
  };

  const confirmAndProcessEndContract = async () => {
    if (!confirmEndContract) return;
    const { contractId, status } = confirmEndContract;
    try {
      await axiosInstance.patch(API_PATH.CONTRACTS.UPDATE_STATUS(contractId), {
        status,
        endDate: terminationEndDate
      });
      toast.success(`Contract successfully marked as ${status}`);
      if (jobId) fetchApplications(jobId);
      const res = await axiosInstance.get(API_PATH.CONTRACTS.GET_ALL);
      const map = {};
      res.data.forEach((c) => { map[`${c.employee?._id || c.employee}_${c.job?._id || c.job}`] = c; });
      setContracts(map);
      setConfirmEndContract(null);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to update status to ${status}`);
      setConfirmEndContract(null);
    }
  };

  const groupedApplications = useMemo(() => {
    // Backend now provides matchScore and matchReason via aggregation
    const filtered = applications.filter((app) => app.job && app.job.title);

    return filtered.reduce((acc, app) => {
      const jobId = app.job._id;
      if (!acc[jobId]) {
        acc[jobId] = {
          job: app.job,
          applications: [],
        };
      }
      acc[jobId].applications.push(app);
      return acc;
    }, {});
  }, [applications]);

  const handleDownloadResume = (resumeUrl) => {
    if (!resumeUrl) return;
    window.open(resumeUrl, "_blank");
  };

  const currentJobTitle = applications.length > 0 && applications[0].job ? applications[0].job.title : "Applications Overview";

  return (
    <DashboardLayout activeMenu="manage-jobs">
      {loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading applications...</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className=" mb-8 px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
              <div className="w-full sm:w-auto overflow-hidden">
                <Breadcrumbs
                  items={[
                    { label: 'Manage Jobs', onClick: () => navigate('/manage-jobs') },
                    { label: currentJobTitle }
                  ]}
                />
              </div>
              <button
                className="group flex-shrink-0 flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors sm:mt-[-10px]"
                onClick={() => navigate("/manage-jobs")}
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to Jobs</span>
              </button>
            </div>

            <div className="mt-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                {currentJobTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 pb-8">
          {Object.keys(groupedApplications).length === 0 ? (
            // Empty State
            <div className="text-center py-16">
              <Users className="mx-auto h-24 w-24 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No applications available
              </h3>
              <p className="mt-2 text-gray-500">
                No applications found at the moment
              </p>
            </div>
          ) : (
            // Applications by Job
            <div className="space-y-8">
              {Object.values(groupedApplications).map(
                ({ job, applications }) => (
                  <div
                    key={job._id}
                    className="p-4 bg-white rounded-xl shadow-md overflow-hidden"
                  >
                    {/* Job Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-6 py-5 rounded-t-xl sm:rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        {/* Left side: Job title + details */}
                        <div>
                          <h2 className="text-xl sm:text-lg font-bold text-white leading-tight">
                            {job.title}
                          </h2>
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-3 text-blue-100">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 opacity-80" />
                              <span className="text-sm font-medium">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 opacity-80" />
                              <span className="text-sm font-medium">{job.type}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-0.5 rounded-md">
                              <span className="text-xs font-bold text-white uppercase tracking-wider">{job.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right side: Application count */}
                        <div className="bg-white/20 backdrop-blur-sm shadow-sm rounded-lg px-4 py-2 self-start sm:self-center shrink-0">
                          <span className="text-sm text-white font-bold">
                            {applications.length} Application{applications.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Clickable Status Filters */}
                    <div className="px-3 sm:px-6 py-3 bg-gray-50/80 border-b border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {[
                          { key: "all", label: "All", color: "bg-gray-100 text-gray-700", activeColor: "bg-gray-700 text-white", icon: LayoutGrid },
                          { key: "Applied", label: "Applied", color: "bg-blue-50 text-blue-700", activeColor: "bg-blue-600 text-white", icon: Send },
                          { key: "In Review", label: "In Review", color: "bg-amber-50 text-amber-700", activeColor: "bg-amber-500 text-white", icon: Clock },
                          { key: "Accepted", label: "Accepted", color: "bg-emerald-50 text-emerald-700", activeColor: "bg-emerald-600 text-white", icon: CheckCircle2 },
                          { key: "Rejected", label: "Rejected", color: "bg-red-50 text-red-700", activeColor: "bg-red-600 text-white", icon: XCircle },
                          { key: "Terminated", label: "Terminated", color: "bg-slate-100 text-slate-700", activeColor: "bg-slate-700 text-white", icon: UserX },
                          { key: "Resigned", label: "Resigned", color: "bg-orange-50 text-orange-700", activeColor: "bg-orange-600 text-white", icon: LogOut },
                          { key: "Contract Ended", label: "Contract Ended", color: "bg-purple-50 text-purple-700", activeColor: "bg-purple-600 text-white", icon: CalendarX },
                        ].map(({ key, label, color, activeColor, icon: Icon }) => {
                          const isContractStatus = key === "Resigned" || key === "Contract Ended";
                          const count = isContractStatus
                            ? applications.filter(a => { const c = contracts[`${a.applicant?._id}_${jobId}`]; return (c && c.status === key) || a.status === key; }).length
                            : key === "all"
                              ? applications.length
                              : applications.filter(a => a.status === key).length;
                          const isActive = activeTab === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setActiveTab(key)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${isActive
                                ? `${activeColor} shadow-md ring-2 ring-offset-1 ring-current/20 scale-105`
                                : `${color} hover:shadow-sm hover:scale-[1.02]`
                                }`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {count} {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Applications List */}
                    <div className="p-3 sm:p-6 bg-gray-50/50">
                      <div className="space-y-4">
                        {applications
                          .filter((app) => {
                            if (!app.applicant) return false;
                            if (activeTab === "all") return true;
                            if (activeTab === "Contract Ended" || activeTab === "Resigned") {
                              const c = contracts[`${app.applicant?._id}_${jobId}`];
                              return (c && c.status === activeTab) || app.status === activeTab;
                            }
                            return app.status === activeTab;
                          })
                          .map((application) => {
                            const contract = contracts[`${application.applicant?._id}_${jobId}`];
                            return (
                              <div
                                key={application._id}
                                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  {/* Avatar */}
                                  <div className="flex-shrink-0">
                                    {application.applicant.avatar ? (
                                      <img
                                        src={application.applicant.avatar}
                                        alt={application.applicant.fullName}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-lg">
                                          {getInitials(
                                            application.applicant.fullName
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Applicant Info */}
                                  <div className="min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate">
                                      {application.applicant.fullName}
                                    </h3>
                                    <p className="text-gray-600 text-sm truncate">
                                      {application.applicant.email}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
                                      <Calendar className="w-3 h-3" />
                                      <span>
                                        Applied{" "}
                                        {moment(application.createdAt)?.format(
                                          "Do MMM, YYYY"
                                        )}
                                      </span>
                                    </div>

                                    {/* Contract Info */}
                                    {contract && ["Accepted", "Terminated", "Resigned", "Contract Ended"].includes(application.status) && (
                                      <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
                                        <FileText className="w-3 h-3 text-green-600" />
                                        <span className="text-green-700 font-medium">{contract.contractType}</span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">
                                          {moment(contract.startDate).format("MMM YYYY")} –{" "}
                                          {application.terminatedAt ? moment(application.terminatedAt).format("MMM YYYY") : contract.endDate ? moment(contract.endDate).format("MMM YYYY") : "No end date"}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <StatusBadge status={application.status === "Accepted" ? contract.status : application.status} />

                                        {contract.contractType === "Fixed-Term" && contract.status === "Accepted" && application.status === "Accepted" && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); setShowExtendModal(contract); setExtendForm({ duration: 6, durationUnit: "months", reason: "" }); }}
                                            className="ml-1 text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5"
                                          >
                                            <Pencil className="w-3 h-3" /> Extend
                                          </button>
                                        )}
                                        {contract.status === "Accepted" && application.status === "Accepted" && (
                                          <>
                                            <span className="text-gray-400 mx-1">|</span>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleEndContractStatus(contract._id, "Contract Ended", application.applicant.fullName); }}
                                              className="text-purple-600 hover:text-purple-800 underline inline-flex items-center gap-0.5"
                                            >
                                              <CheckCircle2 className="w-3 h-3" /> End Contract
                                            </button>
                                            <span className="text-gray-400 mx-1">|</span>
                                            <button
                                              onClick={(e) => { e.stopPropagation(); handleEndContractStatus(contract._id, "Resigned", application.applicant.fullName); }}
                                              className="text-orange-600 hover:text-orange-800 underline inline-flex items-center gap-0.5"
                                            >
                                              <UserX className="w-3 h-3" /> Mark Resigned
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}

                                    {/* Resignation Request Info */}
                                    {application.status === 'Accepted' && application.resignationRequest && application.resignationRequest.status === 'Pending' && (
                                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between flex-wrap gap-3">
                                        <div className="flex items-center gap-2 text-sm text-amber-800">
                                          <CalendarX className="w-4 h-4 text-amber-600" />
                                          <span>Requested End Date: <span className="font-semibold">{moment(application.resignationRequest.requestedEndDate).format("Do MMM, YYYY")}</span></span>
                                        </div>
                                        <div className="flex gap-2">
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleReviewResignation(application._id, 'Rejected'); }}
                                            className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-md text-xs font-semibold hover:bg-gray-50"
                                          >
                                            Decline
                                          </button>
                                          <button
                                            onClick={(e) => { e.stopPropagation(); handleReviewResignation(application._id, 'Approved'); }}
                                            className="px-3 py-1.5 bg-amber-600 text-white rounded-md text-xs font-semibold hover:bg-amber-700 shadow-sm"
                                          >
                                            Approve
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 mt-4 md:mt-0 w-full md:w-auto">
                                  <div className="col-span-2 sm:col-auto flex justify-start sm:mr-2">
                                    <StatusBadge status={application.status} />
                                  </div>
                                  <button
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={() =>
                                      handleDownloadResume(
                                        application.applicant.resume
                                      )
                                    }
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Resume</span>
                                  </button>

                                  <button
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                    onClick={() =>
                                      setSelectedApplicant(application)
                                    }
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>Preview</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                        {/* Empty state for filtered view */}
                        {applications.filter((app) => {
                          if (!app.applicant) return false;
                          if (activeTab === "all") return true;
                          if (activeTab === "Contract Ended" || activeTab === "Resigned") {
                            const c = contracts[app.applicant?._id];
                            return c && c.status === activeTab;
                          }
                          return app.status === activeTab;
                        }).length === 0 && (
                            <div className="text-center py-10">
                              <Users className="mx-auto h-16 w-16 text-gray-300" />
                              <p className="mt-3 text-gray-500 font-medium">No {activeTab === "all" ? "" : `"${activeTab}" `}applications found</p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Extend Contract Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">Extend Contract</h3>
              <button onClick={() => setShowExtendModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Current end: <strong>{moment(showExtendModal.endDate).format("Do MMM, YYYY")}</strong>
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input type="number" min="1" value={extendForm.duration}
                    onChange={e => setExtendForm({ ...extendForm, duration: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={extendForm.durationUnit}
                    onChange={e => setExtendForm({ ...extendForm, durationUnit: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-sm bg-white">
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <input type="text" value={extendForm.reason}
                  onChange={e => setExtendForm({ ...extendForm, reason: e.target.value })}
                  placeholder="e.g. Project extension"
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowExtendModal(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold">Cancel</button>
              <button onClick={handleExtendContract}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold">Extend</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmEndContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Confirm Action</h3>
              <button onClick={() => setConfirmEndContract(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Are you sure you want to mark <span className="font-bold text-gray-900">{confirmEndContract.applicantName}'s</span> contract as <span className="font-bold text-gray-900">{confirmEndContract.status}</span>?
              </p>

              <div className="mb-6 text-left">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Effective End Date</label>
                <input
                  type="date"
                  value={terminationEndDate}
                  onChange={(e) => setTerminationEndDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setConfirmEndContract(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={confirmAndProcessEndContract}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Resignation Modal */}
      {rejectResignationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Decline End Date</h3>
              <button onClick={() => setRejectResignationModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4 text-sm">
                Please provide a reason for declining this contract end date request. The applicant will be notified.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. End date does not match our records, please contact HR."
                className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
              />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setRejectResignationModal(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleReviewResignation(rejectResignationModal, 'Rejected', rejectReason)}
                  disabled={!rejectReason.trim()}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Confirm Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {selectedApplicant && (
        <ApplicantProfilePreview
          selectedApplicant={selectedApplicant}
          contract={contracts[`${selectedApplicant.applicant._id}_${selectedApplicant.job?._id || selectedApplicant.job}`]}
          handleEndContractStatus={handleEndContractStatus}
          setSelectedApplicant={setSelectedApplicant}
          handleDownloadResume={handleDownloadResume}
          handleExtendClick={(contractData) => {
            setSelectedApplicant(null);
            setShowExtendModal(contractData);
            setExtendForm({ duration: 6, durationUnit: "months", reason: "" });
          }}
          handleReviewResignation={handleReviewResignation}
          handleClose={() => {
            setSelectedApplicant(null);
            if (jobId) fetchApplications(jobId);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ApplicationViewer;