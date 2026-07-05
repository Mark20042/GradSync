import React from "react";
import { CheckCircle, ArrowRight, Mail } from "lucide-react";

const SuccessScreen = ({ onDashboard }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
      <div className="text-center w-full max-w-md px-2 sm:px-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-sm">
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-600" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 sm:mb-4 tracking-tight">
          Interview Submitted!
        </h2>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
          Great job! Your answers have been successfully sent to our AI for analysis.
        </p>
        
        <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-8 sm:mb-10 shadow-sm flex items-start gap-3 sm:gap-4 text-left">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">Check your email</h4>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              We'll send you a detailed performance report as soon as the evaluation is complete.
            </p>
          </div>
        </div>

        <button
          onClick={onDashboard}
          className="w-full py-3.5 sm:py-4 bg-blue-600 text-white rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 text-sm sm:text-base"
        >
          Back to Skill Center
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
