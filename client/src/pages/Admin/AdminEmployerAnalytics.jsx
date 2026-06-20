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
        {data.aiSummary && (
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
                  <p className="text-3xl font-bold">{data.aiSummary.summary?.avgTenureDays ? `${data.aiSummary.summary.avgTenureDays}d` : 'N/A'}</p>
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
        )}

        {/* --- Two Columns --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Applications Over Time */}
          {data.appsOverTime && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <LineChartIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Application Volume & Conversion</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.appsOverTime}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} />
                    <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                    <Area type="monotone" dataKey="applications" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" name="Total Applications" />
                    <Area type="monotone" dataKey="hired" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHired)" name="Hired Candidates" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Retention Stats */}
          {data.retention && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Platform Retention Overview</h3>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="h-[250px] w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.retention.chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.retention.chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? "#10b981" : "#f43f5e"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-4 mt-6 md:mt-0">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Retention Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{data.retention.retentionRate?.toFixed(1)}%</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Retained</p>
                      <p className="text-xl font-bold text-emerald-600">{data.retention.chartData[0].value}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Terminated</p>
                      <p className="text-xl font-bold text-rose-600">{data.retention.chartData[1].value}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Jobs by Applications */}
          {data.topJobs && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Most Attractive Jobs (Platform-wide)</h3>
              </div>
              <div className="space-y-4">
                {data.topJobs.map((job, idx) => (
                  <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        #{idx + 1}
                      </div>
                      <p className="font-semibold text-gray-900">{job.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      {job.applicants}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Gaps */}
          {data.skillGaps && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Platform Skill Gaps</h3>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.skillGaps} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis type="category" dataKey="skill" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="rejectedCount" name="Frequency in Rejected/Terminated" radius={[0, 4, 4, 0]}>
                      {data.skillGaps.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Termination Reasons */}
          {data.terminationReasons && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-gray-900">Primary Reasons for Turnover</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {data.terminationReasons.map((reason, idx) => (
                  <div key={idx} className="flex-1 min-w-[200px] bg-gray-50 rounded-xl p-5 border border-gray-100 relative overflow-hidden group hover:border-rose-200 transition-colors">
                    <div className="absolute right-0 top-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
                    <div className="relative z-10">
                      <p className="text-3xl font-black text-gray-900 mb-1">{reason.count}</p>
                      <p className="text-sm font-semibold text-gray-600 line-clamp-2">{reason.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEmployerAnalytics;
