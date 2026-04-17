import { useEffect, useState } from "react";
import {
  Plus,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { API_PATH } from "./../../utils/apiPath";
import axiosInstance from "./../../utils/axiosInstance";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import JobDashboardCard from "../../components/Cards/JobDashboardCard";
import ApplicationDashboardCard from "../../components/Cards/ApplicationDashboardCard";
import DashboardAreaChart from "../../components/layout/DashboardAreaChart";

const Card = ({ className, title, subtitle, headerAction, children }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      {(title || headerAction) && (
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}
      <div className={title ? "p-6 pb-6" : "p-6"}>{children}</div>
    </div>
  );
};

const AnimatedNumber = ({ value, duration = 2500 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;

    const incrementTime = duration / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    purple: "from-violet-500 to-violet-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <Card
      className={`bg-gradient-to-br ${colorClasses[color]} text-white border-0`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1">
            <AnimatedNumber value={value} />
          </p>
          {trend && (
            <div className="flex items-center mt-1 text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        <div className="bg-white/10 p-3 rounded-xl">
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

import AvailabilityScheduler from "../../components/Employer/AvailabilityScheduler";
import JobFAQManager from "../../components/Employer/JobFAQManager";

const EmployerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // overview, autopilot, interviews
  const [interviews, setInterviews] = useState([]);

  const getInterviews = async () => {
    try {
      const response = await axiosInstance.get("/interviews");
      if (response.status === 200) {
        setInterviews(response.data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "interviews") {
      getInterviews();
    }
  }, [activeTab]);

  const getDashboardOverview = async () => {
    try {
      const response = await axiosInstance.get(API_PATH.DASHBOARD.OVERVIEW);
      if (response.status === 200) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboardOverview();
  }, []);

  return (
    <DashboardLayout activeMenu="employer-dashboard">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Tab Navigation */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === "overview"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
              {activeTab === "overview" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === "autopilot"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("autopilot")}
            >
              Auto-Pilot
              {activeTab === "autopilot" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
            <button
              className={`pb-2 px-4 font-medium transition-colors relative ${activeTab === "interviews"
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("interviews")}
            >
              Interviews
              {activeTab === "interviews" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </div>

          {activeTab === "overview" ? (
            <>
              {/* Dashboard Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                  title="Active Jobs"
                  value={dashboardData?.counts?.totalActiveJobs || 0}
                  icon={Briefcase}
                  trend={true}
                  trendValue={dashboardData?.counts?.trends?.activeJobs || 0}
                  color="blue"
                />
                <StatCard
                  title="Total Applicants"
                  value={dashboardData?.counts?.totalApplications || 0}
                  icon={Users}
                  trend={true}
                  trendValue={`${dashboardData?.counts?.trends?.applications || 0
                    }%`}
                  color="green"
                />
                <StatCard
                  title="Hired"
                  value={dashboardData?.counts?.totalHired || 0}
                  icon={CheckCircle2}
                  trend={true}
                  trendValue={`${dashboardData?.counts?.trends?.totalHired || 0}%`}
                  color="purple"
                />
              </div>

              {/* Applications & Trends Section */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                {/* Section Header */}
                <div className="mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    📊 Monitoring
                  </h2>
                </div>

                {/* Chart Full Width */}
                <div className="w-full">
                  <DashboardAreaChart
                    data={dashboardData?.applicationsPerJob || []}
                  />
                </div>
              </div>

              {/* Recent Jobs and Applications */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card
                  title="Recent Job Posts"
                  subtitle="Your latest job postings"
                  headerAction={
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => navigate("/manage-jobs")}
                    >
                      View All
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {dashboardData?.data?.recentJobs
                      ?.slice(0, 3)
                      ?.map((job, index) => (
                        <JobDashboardCard key={index} job={job} />
                      ))}
                  </div>
                </Card>

                <Card
                  title="Recent Applications"
                  subtitle="Latest candidate applications"
                  headerAction={
                    <button
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      onClick={() => navigate("/manage-jobs")}
                    >
                      View All
                    </button>
                  }
                >
                  <div className="space-y-3">
                    {dashboardData?.data?.recentApplications
                      ?.slice(0, 3)
                      ?.map((data, index) => (
                        <ApplicationDashboardCard
                          key={index}
                          applicant={data?.applicant || ""}
                          position={data?.job?.title || ""}
                          time={moment(data?.updatedAt).fromNow()}
                        />
                      ))}
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card
                title="Quick Actions"
                subtitle="Common tasks to get you started"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Post New Job",
                      icon: Plus,
                      color: "bg-blue-50 text-blue-700",
                      path: "/post-job",
                    },
                    {
                      title: "Review Applications",
                      icon: Users,
                      color: "bg-green-50 text-green-700",
                      path: "/manage-jobs",
                    },
                    {
                      title: "Company Settings",
                      icon: Building2,
                      color: "bg-orange-50 text-orange-700",
                      path: "/company-profile",
                    },
                  ].map((action, index) => (
                    <button
                      key={index}
                      className="flex items-center space-x-3 p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200 text-left w-full"
                      onClick={() => navigate(action.path)}
                    >
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {action.title}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </>
          ) : activeTab === "interviews" ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                Candidate Interviews (AI Assessed)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.length > 0 ? (
                  interviews.map((interview) => (
                    <div
                      key={interview._id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                    >
                      <div className="relative aspect-video bg-black">
                        <video
                          src={interview.recordingUrl}
                          controls
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {interview.candidateId?.fullName || "Candidate"}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {new Date(interview.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-md text-sm font-bold ${interview.aiScore >= 80
                                ? "bg-green-100 text-green-700"
                                : interview.aiScore >= 50
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                          >
                            Score: {interview.aiScore}
                          </div>
                        </div>
                        <div className="mb-3">
                          <span className="text-xs font-semibold uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded">
                            {interview.difficulty}
                          </span>
                        </div>
                        {interview.aiFeedback && (
                          <div className="mt-auto space-y-2 text-sm text-gray-600">
                            {interview.aiFeedback.strengths && (
                              <div>
                                <strong className="text-gray-800">
                                  Strengths:
                                </strong>
                                <ul className="list-disc pl-4 text-xs">
                                  {interview.aiFeedback.strengths
                                    .slice(0, 2)
                                    .map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No interviews found.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Availability & Auto-Reply</h2>
                  <AvailabilityScheduler />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Automated FAQs</h2>
                  <JobFAQManager />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default EmployerDashboard;
