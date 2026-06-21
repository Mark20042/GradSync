import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import toast from "react-hot-toast";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Users,
  Target,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const formatTenure = (days) => {
  if (days === null || days === undefined || isNaN(days)) return "N/A";
  if (days === 0) return "0 days";

  let remainingDays = days;
  let years = Math.floor(remainingDays / 365);
  remainingDays -= years * 365;

  let months = Math.floor(remainingDays / 30);
  remainingDays -= months * 30;

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (remainingDays > 0) parts.push(`${remainingDays}d`);

  return parts.join(' ') || "0 days";
};

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const AdminEmployerAnalytics = () => {
  const [data, setData] = useState({
    appsOverTime: null,
    topJobs: null,
    retention: null,
    terminationReasons: null,
    skillGaps: null,
    aiSummary: null,
  });
  
  const [employers, setEmployers] = useState([]);
  const [selectedEmployer, setSelectedEmployer] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch employers for the dropdown
    axiosInstance.get("/api/admin/users")
      .then(res => {
        setEmployers(res.data.filter(u => u.role === "employer"));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchAllAnalytics();
  }, [selectedEmployer]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const query = selectedEmployer !== "all" ? `?companyId=${selectedEmployer}` : "";
      
      const [
        aiSummaryRes,
        appsRes,
        jobsRes,
        retentionRes,
        reasonsRes,
        skillsRes
      ] = await Promise.all([
        axiosInstance.get(`/api/admin/platform-analytics/ai-summary${query}`),
        axiosInstance.get(`/api/admin/platform-analytics/applications-over-time${query}`),
        axiosInstance.get(`/api/admin/platform-analytics/top-jobs${query}`),
        axiosInstance.get(`/api/admin/platform-analytics/retention${query}`),
        axiosInstance.get(`/api/admin/platform-analytics/termination-reasons${query}`),
        axiosInstance.get(`/api/admin/platform-analytics/skill-gaps${query}`),
      ]);

      setData({
        aiSummary: aiSummaryRes.data,
        appsOverTime: appsRes.data.data,
        topJobs: jobsRes.data.data,
        retention: retentionRes.data,
        terminationReasons: reasonsRes.data.data,
        skillGaps: skillsRes.data.data,
      });
    } catch (error) {
      toast.error("Failed to load platform analytics.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="admin-employer-analytics">
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="admin-employer-analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Platform Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Aggregate hiring funnel, retention, and termination metrics.
            </p>
          </div>
          <div className="w-full md:w-64">
            <select
              className="w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 p-2.5 shadow-sm"
              value={selectedEmployer}
              onChange={(e) => setSelectedEmployer(e.target.value)}
            >
              <option value="all">All Employers (General)</option>
              {employers.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.companyName || emp.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* --- Top Row: AI Summary --- */}
        {selectedEmployer !== "all" && (!data.aiSummary || !data.aiSummary.summary) ? (
          <div className="mb-6 bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-8 h-8 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900">No Executive Insights</h3>
            <p className="text-sm text-gray-500 max-w-md mt-2">This employer has not unlocked their Executive AI Summary yet. Once they generate it, it will appear here.</p>
          </div>
        ) : data.aiSummary && data.aiSummary.summary ? (
          <div className="mb-6">
            <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                  Platform Executive AI Insights
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Conversion Rate</p>
                  <p className="text-3xl font-bold">{data.aiSummary.summary?.conversionRate || 0}%</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Retention Rate</p>
                  <p className="text-3xl font-bold">{data.aiSummary.summary?.retentionRate || 'N/A'}{data.aiSummary.summary?.retentionRate !== 'N/A' && '%'}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Avg Tenure</p>
                  <p className="text-3xl font-bold">{formatTenure(data.aiSummary.summary?.avgTenureDays)}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Top Job</p>
                  <p className="text-xl font-bold truncate">{data.aiSummary.summary?.topJob || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-3 relative z-10">
                {data.aiSummary.insights && data.aiSummary.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-indigo-950/50 p-4 rounded-xl border border-indigo-800/50">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                    <p 
                      className="text-indigo-100 text-sm leading-relaxed [&>b]:text-white [&>b]:font-bold" 
                      dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* --- Two Columns --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Applications Over Time */}
          {data.appsOverTime && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" /> Application Volume & Conversion
                </h3>
              </div>
              <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.appsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Area type="monotone" name="Applications" dataKey="applications" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    <Area type="monotone" name="Hired" dataKey="hired" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHired)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Retention Stats */}
          {data.retention && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600" /> Platform Retention Overview
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Retention Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{data.retention.retentionRate !== null ? `${data.retention.retentionRate}%` : 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Avg Tenure</p>
                  <p className="text-2xl font-bold text-gray-900">{formatTenure(data.retention.avgTenureDays)}</p>
                </div>
              </div>

              <div className="flex-1 min-h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.retention.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="terminated" name="Terminations" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}



          {/* Skill Gaps */}
          {selectedEmployer !== "all" && !data.skillGaps ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center min-h-[350px]">
              <Target className="w-8 h-8 text-gray-400 mb-3" />
              <h3 className="font-bold text-gray-900">Skill Mismatch Analysis Locked</h3>
              <p className="text-sm text-gray-500 max-w-sm mt-2">This employer has not unlocked the Skill Gap AI analysis yet.</p>
            </div>
          ) : data.skillGaps ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Platform Skill Mismatch</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-4">
                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required Skills</p>
                  {data.skillGaps.topRequiredSkills?.length > 0 ? (
                    data.skillGaps.topRequiredSkills.slice(0, 5).map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{sk.skill}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{sk.requiredInJobs} jobs</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No skills specified.</p>
                  )}
                </div>
                
                <div className="w-full h-px sm:w-px sm:h-auto bg-gray-100 shrink-0" />

                <div className="flex-1 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Common in Rejects</p>
                  {data.skillGaps.topSkillGaps?.length > 0 ? (
                    data.skillGaps.topSkillGaps.slice(0, 5).map((sk, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{sk.skill}</span>
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">{sk.rejectedCount} candidates</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">No data yet.</p>
                  )}
                </div>
              </div>

              {/* AI Recommendations */}
              {data.skillGaps.aiRecommendations && data.skillGaps.aiRecommendations.length > 0 && (
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Action Plan
                  </p>
                  <ul className="space-y-2">
                    {data.skillGaps.aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold text-gray-900">$1</span>') }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Termination Reasons */}
          {data.terminationReasons && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full min-h-[350px]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" /> Primary Reasons for Turnover
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-4">Based on admin-configurable termination categories.</p>
              
              {data.terminationReasons.length > 0 ? (
                <div className="flex-1 min-h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.terminationReasons}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="label"
                      >
                        {data.terminationReasons.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  No termination data available yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmployerAnalytics;
