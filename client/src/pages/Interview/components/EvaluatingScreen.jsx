import React from "react";
import { Loader2 } from "lucide-react";

const EvaluatingScreen = () => {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-4">
      <div className="text-center max-w-md w-full">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 sm:mb-8">
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30"></div>
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 sm:mb-3">
          AI is Evaluating Your Answers
        </h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Our AI interviewer is carefully analyzing your responses against the
          ideal answers. This may take a minute...
        </p>
        <div className="mt-8 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-blue-500"
              style={{
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default EvaluatingScreen;
