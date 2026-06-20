import React, { useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
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
  Award
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
import AnalyticsGate from "../../components/AnalyticsGate";

const COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const EmployerAnalytics = () => {
  const { user, updateUser } = useAuth();

  // State for unlocked data
  const [unlockedState, setUnlockedState] = useState({
    appsOverTime: false,
    topJobs: false,
    retention: false,
    terminationReasons: false,
    skillGaps: false,
    aiSummary: false,
  });

  const [data, setData] = useState({
    appsOverTime: null,
    topJobs: null,
    retention: null,
    terminationReasons: null,
    skillGaps: null,
    aiSummary: null,
  });

  // Generic unlock handler
  const unlockFeature = async (featureKey, endpoint, cost) => {
    if (user?.aiTokens < cost) {
      window.dispatchEvent(new CustomEvent("openTokenModal"));
      return;
    }
    
    try {
      const toastId = toast.loading("Processing analysis...");
      const res = await axiosInstance.get(endpoint);
      setData((prev) => ({ ...prev, [featureKey]: res.data }));
      setUnlockedState((prev) => ({ ...prev, [featureKey]: true }));
      updateUser({ aiTokens: user.aiTokens - cost });
      toast.success("Analysis generated successfully!", { id: toastId });
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || "Failed to generate analysis");
    }
  };

  return (
    <DashboardLayout activeMenu="analytics">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-indigo-600" />
              Advanced Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Deep dive into your hiring funnel, retention, and termination metrics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
            <img src="/gradcoin.svg" alt="GradCoin" className="w-5 h-5 object-contain" />
            <span className="font-bold text-indigo-700">{user?.aiTokens || 0}</span>
            <span className="text-sm text-indigo-600/80 font-medium ml-1">Coins Available</span>
          </div>
        </div>

        {/* --- Top Row: AI Summary (Full Width) --- */}
        <div className="mb-6">
          <AnalyticsGate
            title="Executive AI Summary"
            description="Get a comprehensive narrative of your company's recruitment health, conversion rates, and overall retention standing."
            icon={BrainCircuit}
            cost={20}
            isUnlocked={unlockedState.aiSummary}
            onUnlock={() => unlockFeature("aiSummary", API_PATH.EMPLOYER_ANALYTICS.AI_SUMMARY, 20)}
          >
            {data.aiSummary && (
              <div className="bg-gradient-to-br from-indigo-900 to-violet-900 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 relative z-10">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                    Executive AI Insights
                  </h2>
                  <button 
                    onClick={() => unlockFeature("aiSummary", API_PATH.EMPLOYER_ANALYTICS.AI_SUMMARY, 20)}
                    className="relative z-10 flex items-center gap-1.5 bg-indigo-800/80 hover:bg-indigo-700 text-indigo-100 text-xs px-3 py-1.5 rounded-lg transition-colors border border-indigo-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Re-run (20 🪙)
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 relative z-10">
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Conversion Rate</p>
                    <p className="text-3xl font-bold">{data.aiSummary.summary.conversionRate}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Retention Rate</p>
                    <p className="text-3xl font-bold">{data.aiSummary.summary.retentionRate}{data.aiSummary.summary.retentionRate !== 'N/A' && '%'}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Avg Tenure</p>
                    <p className="text-3xl font-bold">{data.aiSummary.summary.avgTenureDays ? `${data.aiSummary.summary.avgTenureDays}d` : 'N/A'}</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Company Rating</p>
                    <p className="text-3xl font-bold">{data.aiSummary.summary.companyRating ? `${data.aiSummary.summary.companyRating.toFixed(1)}` : 'N/A'}</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {data.aiSummary.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-indigo-950/50 p-4 rounded-xl border border-indigo-800/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                      <p className="text-sm text-indigo-100 leading-relaxed" dangerouslySetInnerHTML={{ __html: insight.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-white">$1</span>') }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </AnalyticsGate>
        </div>

        {/* --- Two Columns Layout --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Applications Over Time */}
          <AnalyticsGate
            title="Applications Trend"
            description="Visualize the influx of applications and hires over the past 12 months to identify seasonal hiring trends."
            icon={LineChartIcon}
            cost={5}
            isUnlocked={unlockedState.appsOverTime}
            onUnlock={() => unlockFeature("appsOverTime", API_PATH.EMPLOYER_ANALYTICS.APPLICATIONS_OVER_TIME, 5)}
          >
            {data.appsOverTime && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" /> Applications & Hires (Last 12 Months)
                  </h3>
                  <button 
                    onClick={() => unlockFeature("appsOverTime", API_PATH.EMPLOYER_ANALYTICS.APPLICATIONS_OVER_TIME, 5)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Re-run (5 🪙)
                  </button>
                </div>
                <div className="flex-1 min-h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.appsOverTime.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </AnalyticsGate>

          {/* Retention & Tenure */}
          <AnalyticsGate
            title="Retention Insights"
            description="Understand employee lifecycle lengths and visualize monthly termination counts."
            icon={Users}
            cost={10}
            isUnlocked={unlockedState.retention}
            onUnlock={() => unlockFeature("retention", API_PATH.EMPLOYER_ANALYTICS.RETENTION, 10)}
          >
            {data.retention && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" /> Employee Retention
                  </h3>
                  <button 
                    onClick={() => unlockFeature("retention", API_PATH.EMPLOYER_ANALYTICS.RETENTION, 10)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Re-run (10 🪙)
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Retention Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{data.retention.retentionRate !== null ? `${data.retention.retentionRate}%` : 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Avg Tenure</p>
                    <p className="text-2xl font-bold text-gray-900">{data.retention.avgTenureDays !== null ? `${data.retention.avgTenureDays} days` : 'N/A'}</p>
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
          </AnalyticsGate>

          {/* Termination Reasons */}
          <AnalyticsGate
            title="Termination Reasons"
            description="Break down the most common reasons why employees leave or are terminated from your company."
            icon={PieChartIcon}
            cost={10}
            isUnlocked={unlockedState.terminationReasons}
            onUnlock={() => unlockFeature("terminationReasons", API_PATH.EMPLOYER_ANALYTICS.TERMINATION_REASONS, 10)}
          >
            {data.terminationReasons && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Top Termination Reasons
                  </h3>
                  <button 
                    onClick={() => unlockFeature("terminationReasons", API_PATH.EMPLOYER_ANALYTICS.TERMINATION_REASONS, 10)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Re-run (10 🪙)
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-4">Based on admin-configurable termination categories.</p>
                
                {data.terminationReasons.data.length > 0 ? (
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.terminationReasons.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="label"
                        >
                          {data.terminationReasons.data.map((entry, index) => (
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
          </AnalyticsGate>

          {/* Skill Gaps */}
          <AnalyticsGate
            title="Skill Gap Analysis"
            description="Identify which skills your rejected applicants possess versus what you actually require."
            icon={Target}
            cost={15}
            isUnlocked={unlockedState.skillGaps}
            onUnlock={() => unlockFeature("skillGaps", API_PATH.EMPLOYER_ANALYTICS.SKILL_GAPS, 15)}
          >
            {data.skillGaps && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full min-h-[350px] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-indigo-600" /> Skill Mismatch
                  </h3>
                  <button 
                    onClick={() => unlockFeature("skillGaps", API_PATH.EMPLOYER_ANALYTICS.SKILL_GAPS, 15)}
                    className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs px-2.5 py-1.5 rounded-lg transition-colors border border-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Re-run (15 🪙)
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 mb-4">
                  <div className="flex-1 space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Required by You</p>
                    {data.skillGaps.topRequiredSkills.length > 0 ? (
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
                    {data.skillGaps.topSkillGaps.length > 0 ? (
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
                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI Recommendations
                    </p>
                    <ul className="space-y-2">
                      {data.skillGaps.aiRecommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-50">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </AnalyticsGate>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerAnalytics;
