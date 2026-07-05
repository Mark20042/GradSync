import React from "react";
import { Shield, CheckCircle, Check, ArrowLeft, ChevronRight } from "lucide-react";

const AgreementStep = ({ hasAgreed, setHasAgreed, onBack, onNext }) => {
  return (
    <div className="animate-in fade-in max-w-2xl w-[95%] sm:w-full mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          Consent & Agreement
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Please acknowledge the following before proceeding.
        </p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 mb-6">
        <div className="space-y-3 sm:space-y-4 mb-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              I understand that my <strong>spoken answers will be recorded via Speech-to-Text</strong> and transcribed for AI evaluation purposes.
            </p>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              I understand that my <strong>interview scores and feedback will be stored</strong> in my profile and may be visible to potential employers.
            </p>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              I understand that the AI evaluation is <strong>automated and for practice purposes</strong>. Scores reflect comparison against reference answers and do not guarantee job placement.
            </p>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              I will maintain <strong>academic honesty</strong> and answer questions to the best of my own knowledge without using external assistance.
            </p>
          </div>
        </div>

        <div
          onClick={() => setHasAgreed(!hasAgreed)}
          className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            hasAgreed
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 sm:mt-0 rounded-md sm:rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              hasAgreed
                ? "bg-emerald-500 border-emerald-500"
                : "border-slate-300 bg-white"
            }`}
          >
            {hasAgreed && <Check size={14} className="text-white" />}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
            I have read and agree to all the terms, rules, and guidelines above. I am ready to proceed.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all hover:border-slate-300 cursor-pointer flex items-center justify-center gap-2 order-last sm:order-none"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasAgreed}
          className={`flex-[2] font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
            hasAgreed
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 hover:-translate-y-0.5"
              : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
          }`}
        >
          Continue to Setup <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default AgreementStep;
