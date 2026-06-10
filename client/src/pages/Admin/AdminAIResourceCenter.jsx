import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import DashboardLayout from "../../components/layout/DashboardLayout";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Sparkles, BarChart2, DollarSign, Settings, Save, Loader2 } from "lucide-react";

const AdminAIResourceCenter = () => {
  const [metrics, setMetrics] = useState(null);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addingTokens, setAddingTokens] = useState({});
  const [costs, setCosts] = useState({
    interview: 20,
    jobMatch: 1,
    suitability: 1,
    skillVerification: 1,
    profileGeneration: 1
  });
  const [initialTokens, setInitialTokens] = useState({
    graduate: 5,
    jobseeker: 5,
    employer: 5
  });
  const [tokenPackages, setTokenPackages] = useState({
    basic: { tokens: 5, price: 109 },
    popular: { tokens: 15, price: 239 },
    premium: { tokens: 30, price: 549 }
  });

  const fetchData = async () => {
    try {
      const [metricsRes, settingsRes, usersRes] = await Promise.all([
        axiosInstance.get("/api/admin/system-metrics"),
        axiosInstance.get("/api/admin/system-settings"),
        axiosInstance.get("/api/admin/users")
      ]);
      setMetrics(metricsRes.data);
      setUsers(usersRes.data);
      if (settingsRes.data) {
        if (settingsRes.data.aiCosts) {
          setSettings(settingsRes.data);
          setCosts(settingsRes.data.aiCosts);
        }
        if (settingsRes.data.initialTokens) {
          setInitialTokens(settingsRes.data.initialTokens);
        }
        if (settingsRes.data.tokenPackages) {
          setTokenPackages(settingsRes.data.tokenPackages);
        }
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
      const safeCosts = {};
      for (const key in costs) safeCosts[key] = isNaN(costs[key]) || costs[key] === "" ? 0 : Number(costs[key]);
      
      const safeInitial = {};
      for (const key in initialTokens) safeInitial[key] = isNaN(initialTokens[key]) || initialTokens[key] === "" ? 0 : Number(initialTokens[key]);

      const safePackages = {};
      for (const pkg in tokenPackages) {
        safePackages[pkg] = {
          tokens: isNaN(tokenPackages[pkg].tokens) || tokenPackages[pkg].tokens === "" ? 0 : Number(tokenPackages[pkg].tokens),
          price: isNaN(tokenPackages[pkg].price) || tokenPackages[pkg].price === "" ? 0 : Number(tokenPackages[pkg].price)
        };
      }

      await axiosInstance.put("/api/admin/system-settings", { 
        aiCosts: safeCosts,
        initialTokens: safeInitial,
        tokenPackages: safePackages
      });
      toast.success("AI settings updated successfully!");
    } catch (error) {
      console.error("Failed to update costs:", error);
      toast.error("Failed to update AI costs.");
    } finally {
      setSaving(false);
    }
  };

  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
  };

  const handleInitialTokenChange = (e) => {
    const { name, value } = e.target;
    setInitialTokens(prev => ({
      ...prev,
      [name]: value === "" ? "" : Number(value)
    }));
  };

  const handlePackageChange = (pkg, field, value) => {
    setTokenPackages(prev => ({
      ...prev,
      [pkg]: {
        ...prev[pkg],
        [field]: value === "" ? "" : Number(value)
      }
    }));
  };

  const handleAdjustTokens = async (userId, currentTokens, amountToAdjust) => {
    setAddingTokens(prev => ({ ...prev, [userId]: true }));
    try {
      const newAmount = Math.max(0, (currentTokens || 0) + amountToAdjust);
      if (newAmount === currentTokens) {
        setAddingTokens(prev => ({ ...prev, [userId]: false }));
        return;
      }
      await axiosInstance.put(`/api/admin/users/${userId}`, { aiTokens: newAmount });
      const message = amountToAdjust > 0 ? `${amountToAdjust} GradCoins added successfully!` : `${Math.abs(amountToAdjust)} GradCoins removed successfully!`;
      toast.success(message);
      // Update local state
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, aiTokens: newAmount } : u
      ));
    } catch (error) {
      console.error("Failed to adjust tokens:", error);
      toast.error("Failed to adjust tokens.");
    } finally {
      setAddingTokens(prev => ({ ...prev, [userId]: false }));
    }
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Generation Cost</label>
                <input
                  type="number"
                  name="profileGeneration"
                  min="0"
                  value={costs.profileGeneration || 1}
                  onChange={handleCostChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <img src="/gradcoin.svg" alt="GradCoin" className="w-5 h-5 drop-shadow-sm" />
              Initial Registration Tokens
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set the number of free tokens given to new users when they register.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduate</label>
                <input
                  type="number"
                  name="graduate"
                  min="0"
                  value={initialTokens.graduate}
                  onChange={handleInitialTokenChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Seeker</label>
                <input
                  type="number"
                  name="jobseeker"
                  min="0"
                  value={initialTokens.jobseeker}
                  onChange={handleInitialTokenChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer</label>
                <input
                  type="number"
                  name="employer"
                  min="0"
                  value={initialTokens.employer}
                  onChange={handleInitialTokenChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-100" />

            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <img src="/gradcoin.svg" alt="GradCoin" className="w-5 h-5 drop-shadow-sm" />
              Token Purchase Packages
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure the 3 token purchase packages shown to users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              {['basic', 'popular', 'premium'].map((pkg) => (
                <div key={pkg} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-700 capitalize mb-3 pb-2 border-b border-gray-200">{pkg} Package</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Number of Tokens</label>
                      <input
                        type="number"
                        min="1"
                        value={tokenPackages[pkg].tokens}
                        onChange={(e) => handlePackageChange(pkg, 'tokens', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Price (₱)</label>
                      <input
                        type="number"
                        min="1"
                        value={tokenPackages[pkg].price}
                        onChange={(e) => handlePackageChange(pkg, 'price', e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleSaveCosts}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                    Saving...
                  </>
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

        {/* User Tokens Table */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 drop-shadow-md" />
              User Token Balances
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Monitor remaining tokens for all users and manually add more GradCoins to their accounts. Users with the lowest balances are shown first.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-center">Remaining Tokens</th>
                  <th className="px-6 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[...users].sort((a, b) => (a.aiTokens || 0) - (b.aiTokens || 0)).map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex flex-shrink-0 items-center justify-center font-bold text-xs uppercase">
                          {u.fullName?.charAt(0) || u.email.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{u.fullName || "N/A"}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'employer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-extrabold text-gray-900 text-xl leading-none">
                        <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 drop-shadow-sm object-contain -mt-0.5" />
                        {u.aiTokens || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleAdjustTokens(u._id, u.aiTokens, -10)}
                          disabled={addingTokens[u._id] || (u.aiTokens || 0) < 10}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-medium text-xs rounded-lg transition-colors border border-red-200 disabled:opacity-50"
                        >
                          -10 Tokens
                        </button>
                        <button
                          onClick={() => handleAdjustTokens(u._id, u.aiTokens, -5)}
                          disabled={addingTokens[u._id] || (u.aiTokens || 0) < 5}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-medium text-xs rounded-lg transition-colors border border-orange-200 disabled:opacity-50"
                        >
                          -5 Tokens
                        </button>
                        <button
                          onClick={() => handleAdjustTokens(u._id, u.aiTokens, 5)}
                          disabled={addingTokens[u._id]}
                          className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-xs rounded-lg transition-colors border border-green-200 disabled:opacity-50"
                        >
                          {addingTokens[u._id] ? "Processing..." : "+5 Tokens"}
                        </button>
                        <button
                          onClick={() => handleAdjustTokens(u._id, u.aiTokens, 10)}
                          disabled={addingTokens[u._id]}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-lg transition-colors border border-blue-200 disabled:opacity-50"
                        >
                          +10 Tokens
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminAIResourceCenter;
