import React from "react";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

const SuccessScreen = ({ onDashboard }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
      <div className="text-center max-w-md px-6">
        <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Interview Submitted!
        </h2>
        <p className="text-slate-500 text-lg leading-relaxed mb-10">
          Great job! Your answers have been successfully sent to our AI for analysis.
        </p>
        
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-10 shadow-sm flex items-start gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Check your email</h4>
            <p className="text-sm text-slate-500">
              We'll send you a detailed performance report as soon as the evaluation is complete.
            </p>
          </div>
        </div>

        <button
          onClick={onDashboard}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Back to Skill Center
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
