import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { Sparkles, BarChart2, DollarSign, Settings, Save } from "lucide-react";
import LoadingSpinner from "../../components/LoadingSpinner";

const AdminAIResourceCenter = () => {
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [costs, setCosts] = useState({
    interview: 2,
    jobMatch: 1,
    suitability: 1,
    skillVerification: 1
  });

  const fetchData = async () => {
    try {
      const [metricsRes, settingsRes] = await Promise.all([
        axiosInstance.get("/api/admin/system-metrics"),
        axiosInstance.get("/api/admin/system-settings")
      ]);
      setMetrics(metricsRes.data);
      if (settingsRes.data && settingsRes.data.aiCosts) {
        setSettings(settingsRes.data);
        setCosts(settingsRes.data.aiCosts);
      }
    } catch (error) {
      console.error("Failed to fetch AI data:", error);
      toast.error("Failed to load AI resource data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCosts = async () => {
    setSaving(true);
    try {
      await axiosInstance.put("/api/admin/system-settings", { aiCosts: costs });
      toast.success("AI costs updated successfully!");
    } catch (error) {
      console.error("Failed to update costs:", error);
      toast.error("Failed to update AI costs.");
    } finally {
      setSaving(false);
    }
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: Number(value) }));
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="admin-ai-resource-center">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  const geminiLimit = 500;
  const gemmaLimit = 1500;
  const geminiUsage = metrics?.geminiDailyRequests || 0;
  const gemmaUsage = metrics?.gemmaDailyRequests || 0;

  const geminiPercentage = Math.min((geminiUsage / geminiLimit) * 100, 100);
  const gemmaPercentage = Math.min((gemmaUsage / gemmaLimit) * 100, 100);

  const getProgressColor = (percentage) => {
    if (percentage > 90) return "bg-red-500";
    if (percentage > 75) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <DashboardLayout activeMenu="admin-ai-resource-center">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-600" />
            AI Resource Center
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor global API usage to prevent Google AI Studio exhaustion and manage Token Economy pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Usage Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-purple-600" />
              Daily API Traffic Limits
            </h2>

            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-gray-700">Gemini (Evaluator) Traffic</span>
                <span className={`font-bold ${geminiPercentage > 90 ? 'text-red-600' : 'text-gray-600'}`}>
                  {geminiUsage} / {geminiLimit} RPD
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(geminiPercentage)}`} 
                  style={{ width: `${geminiPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Powers interview evaluation, suitability scans, and summaries.</p>
            </div>

            <hr className="my-6 border-gray-100" />

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="font-semibold text-gray-700">Gemma (Generator) Traffic</span>
                <span className={`font-bold ${gemmaPercentage > 90 ? 'text-red-600' : 'text-gray-600'}`}>
                  {gemmaUsage} / {gemmaLimit} RPD
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(gemmaPercentage)}`} 
                  style={{ width: `${gemmaPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Powers assessment generation and interview drafting.</p>
            </div>
          </div>

          {/* Token Pricing Engine */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Token Economy Pricing
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Adjust how many tokens are deducted when users utilize specific AI features. Set higher costs for intensive operations.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Interview Cost</label>
                <input
                  type="number"
                  name="interview"
                  min="0"
                  value={costs.interview}
                  onChange={handleCostChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Take Assessment Cost</label>
                <input
                  type="number"
                  name="skillVerification"
                  min="0"
                  value={costs.skillVerification}
                  onChange={handleCostChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Match Scan Cost</label>
                <input
                  type="number"
                  name="jobMatch"
                  min="0"
                  value={costs.jobMatch}
                  onChange={handleCostChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suitability Check Cost</label>
                <input
                  type="number"
                  name="suitability"
                  min="0"
                  value={costs.suitability}
                  onChange={handleCostChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveCosts}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <LoadingSpinner className="w-5 h-5 text-white" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Pricing Config
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAIResourceCenter;
