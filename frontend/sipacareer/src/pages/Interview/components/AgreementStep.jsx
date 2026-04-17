import React from "react";
import { Shield, CheckCircle, Check, ArrowLeft, ChevronRight } from "lucide-react";

const AgreementStep = ({ hasAgreed, setHasAgreed, onBack, onNext }) => {
  return (
    <div className="animate-in fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Consent & Agreement
        </h1>
        <p className="text-slate-500">
          Please acknowledge the following before proceeding.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              I understand that my <strong>spoken answers will be recorded via Speech-to-Text</strong> and transcribed for AI evaluation purposes.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              I understand that my <strong>interview scores and feedback will be stored</strong> in my profile and may be visible to potential employers.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              I understand that the AI evaluation is <strong>automated and for practice purposes</strong>. Scores reflect comparison against reference answers and do not guarantee job placement.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-slate-700">
              I will maintain <strong>academic honesty</strong> and answer questions to the best of my own knowledge without using external assistance.
            </p>
          </div>
        </div>

        <div
          onClick={() => setHasAgreed(!hasAgreed)}
          className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
            hasAgreed
              ? "border-emerald-400 bg-emerald-50"
              : "border-slate-200 bg-slate-50 hover:border-slate-300"
          }`}
        >
          <div
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              hasAgreed
                ? "bg-emerald-500 border-emerald-500"
                : "border-slate-300 bg-white"
            }`}
          >
            {hasAgreed && <Check size={14} className="text-white" />}
          </div>
          <p className="text-sm font-semibold text-slate-800">
            I have read and agree to all the terms, rules, and guidelines above. I am ready to proceed.
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl text-base transition-all hover:border-slate-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasAgreed}
          className={`flex-[2] font-bold py-4 px-8 rounded-2xl text-base transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
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
