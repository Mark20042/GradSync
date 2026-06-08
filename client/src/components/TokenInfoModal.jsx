import React from "react";
import { Sparkles, X, Info, Shield, Zap } from "lucide-react";

const TokenInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white text-center">
          <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-1">
            <img src="/gradcoin.svg" alt="GradCoin" className="w-16 h-16 drop-shadow-lg object-contain" />
          </div>
          <h2 className="text-2xl font-bold">AI Tokens (GradCoins)</h2>
          <p className="text-blue-100 mt-1">Your access to intelligent features</p>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
            AI Tokens power the advanced artificial intelligence features on GradSync. Each time you use an AI tool, tokens are deducted from your balance based on the complexity of the operation.
          </p>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex flex-shrink-0 items-center justify-center">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">How to get tokens</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You receive a free sign-up bonus when you register! If you run out, please contact the Administrator to request more.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex flex-shrink-0 items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Where are they used?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Tokens are spent when taking AI Mock Interviews, Skill Assessments, or scanning for Job Suitability Matches.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex flex-shrink-0 items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Why the limit?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We limit usage to maintain high performance and availability for all users on our platform.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button 
              onClick={onClose}
              className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoModal;
