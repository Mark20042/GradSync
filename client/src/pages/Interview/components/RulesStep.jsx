import React from "react";
import { BookOpen, Shield, Volume2, Clock, Target, AlertTriangle, ChevronRight } from "lucide-react";

const RulesStep = ({ onNext }) => {
  return (
    <div className="animate-in fade-in max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Interview Rules & Guidelines
        </h1>
        <p className="text-slate-500">
          Please read the following rules carefully before starting your mock interview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Professional Environment</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Treat this as a real interview. Find a quiet, well-lit space. Dress appropriately and maintain a professional demeanor.
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Speech-to-Text Recording</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Your spoken answers will be captured via the microphone and transcribed to text. Speak clearly and at a moderate pace for the best accuracy.
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Time & Flow</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Listen carefully as the AI reads each question. Take a moment to think, then answer. You can repeat a question if needed. Click "Next" when ready to move on.
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-50 text-purple-600 border border-purple-100">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">AI Evaluation</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              After you finish, your answers are evaluated by AI against ideal reference answers. You'll receive a score (0-100) and detailed feedback for each question.
            </p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-200 p-6 flex flex-col gap-4 lg:col-span-2">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 text-red-500 border border-red-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-2">Important Reminders</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Do not refresh or leave the page during the interview. Your progress will be lost. Ensure a stable internet connection. Use Google Chrome or Microsoft Edge for best Speech to Text support.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        <button
          onClick={onNext}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
        >
          I've Read the Rules <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default RulesStep;
