import React, { useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const AnalyticsGate = ({
  title,
  description,
  icon: Icon = Sparkles,
  cost,
  isUnlocked,
  onUnlock,
  children,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    if (user?.aiTokens < cost) {
      window.dispatchEvent(new CustomEvent("openTokenModal"));
      return;
    }
    setLoading(true);
    try {
      await onUnlock();
    } catch (e) {
      console.error("Unlock error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (isUnlocked) {
    return <div className="h-full flex flex-col">{children}</div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden relative group h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center shadow-sm">
      {/* Abstract Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
      
      <div className="relative z-10 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-indigo-100">
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          {title} <Lock className="w-4 h-4 text-gray-400" />
        </h3>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {description}
        </p>
        
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Unlock Analysis
              <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs ml-1">
                <img src="/gradcoin.svg" alt="GradCoin" className="w-4 h-4 object-contain" />
                {cost}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AnalyticsGate;
