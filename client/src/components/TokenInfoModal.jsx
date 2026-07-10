import React, { useState, useEffect } from "react";
import { Sparkles, X, Info, Shield, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../utils/axiosInstance";

const TokenInfoModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(15);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.systemSettings?.tokenPackages?.popular?.tokens) {
      setSelectedPackage(user.systemSettings.tokenPackages.popular.tokens);
    }
  }, [user?.systemSettings?.tokenPackages?.popular?.tokens]);

  if (!isOpen) return null;

  const getSelectedPrice = () => {
    const defaultPackages = { basic: { tokens: 5, price: 109 }, popular: { tokens: 15, price: 299 }, premium: { tokens: 50, price: 899 } };
    const packages = ['basic', 'popular', 'premium'].map(pkgName => user?.systemSettings?.tokenPackages?.[pkgName] || defaultPackages[pkgName]);
    const selected = packages.find(pkg => pkg.tokens === selectedPackage);
    return selected ? selected.price : 0;
  };

  const handlePurchase = async () => {
    const selectedPrice = getSelectedPrice();
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/payments/create-gcash', {
        amount: selectedPrice * 100, // PayMongo uses centavos
        description: `Purchase ${selectedPackage} GradCoins`,
        tokens: selectedPackage
      });

      if (response.data.success && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-20 bg-black/20 p-1.5 rounded-full backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Header */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white text-center relative overflow-hidden shrink-0">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 -left-10 w-40 h-40 bg-blue-400 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 mx-auto mb-4 flex justify-center">
            <img src="/gradcoin.svg" alt="GradCoin" className="w-24 h-24 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] object-contain transform hover:scale-105 transition-transform duration-500 ease-out" />
          </div>
          <h2 className="text-3xl font-black tracking-tight relative z-10 drop-shadow-sm">Get GradCoins</h2>
          <p className="text-blue-100 mt-2 font-medium relative z-10 text-sm">Power up your AI tools instantly</p>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto bg-gray-50 flex-1">
          <div className="space-y-6">

            {/* Informational Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-2xl p-6 border border-blue-100 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(59,130,246,0.15)] transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">What are they for?</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  GradCoins are your key to unlocking premium AI career tools. Spend them to take highly realistic <strong className="text-indigo-700">AI Mock Interviews</strong>, complete <strong className="text-indigo-700">Skill Assessments</strong>, and unlock instant <strong className="text-indigo-700">Job Suitability Matches</strong>.
                </p>
              </div>

              <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl p-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(16,185,129,0.15)] transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-inner">
                    <Info className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-xl tracking-tight">How do I get them?</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">
                  Every user receives a free batch of GradCoins upon registration. If you run out, you can instantly refill your balance below. Your purchased GradCoins <strong className="text-emerald-700">never expire</strong> and are credited to your account <strong className="text-emerald-700">instantly</strong>.
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-gray-200 flex-1"></div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select a Package</h3>
              <div className="h-px bg-gray-200 flex-1"></div>
            </div>

            {/* Pricing Tiers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {['basic', 'popular', 'premium'].map((pkgName) => {
                const pkg = user?.systemSettings?.tokenPackages?.[pkgName] || { tokens: 5, price: 109 };
                const aiCosts = user?.systemSettings?.aiCosts || { interview: 20, jobMatch: 1, skillVerification: 2 };

                // Calculate dynamic usage
                const mockInterviews = Math.floor(pkg.tokens / aiCosts.interview);
                const skillAssessments = Math.floor(pkg.tokens / aiCosts.skillVerification);
                const jobMatches = Math.floor(pkg.tokens / aiCosts.jobMatch);

                const bullets = [
                  mockInterviews > 0 ? `${mockInterviews} AI Mock Interview${mockInterviews > 1 ? 's' : ''}` : "No AI Mock Interviews",
                  `${skillAssessments} AI Skill Assessments`,
                  `${jobMatches} Instant Job Matches`
                ];

                const isPopular = pkgName === 'popular';

                return (
                  <button
                    key={pkgName}
                    onClick={() => setSelectedPackage(pkg.tokens)}
                    className={`w-full relative flex flex-col items-center justify-start p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden ${selectedPackage === pkg.tokens
                      ? "border-indigo-500 bg-indigo-50/40 shadow-[0_8px_25px_-5px_rgba(99,102,241,0.3)] transform scale-[1.03] z-10"
                      : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 hover:shadow-lg"
                      }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 left-0 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[11px] font-extrabold py-1 shadow-sm tracking-widest uppercase text-center">
                        Best Value
                      </div>
                    )}

                    <div className={`mt-3 w-7 h-7 rounded-full border-2 flex shrink-0 items-center justify-center transition-colors mb-4 ${selectedPackage === pkg.tokens ? "border-indigo-600 bg-indigo-600 shadow-md" : "border-gray-300"
                      }`}>
                      {selectedPackage === pkg.tokens && <Check className="w-4 h-4 text-white" strokeWidth={4} />}
                    </div>

                    <span className={`block font-black text-3xl mb-1 ${selectedPackage === pkg.tokens ? "text-indigo-900" : "text-gray-900"}`}>
                      {pkg.tokens} <span className="text-xl font-bold text-gray-500">Coins</span>
                    </span>

                    <span className={`font-black text-2xl mb-5 ${selectedPackage === pkg.tokens ? "text-indigo-600" : "text-gray-600"}`}>
                      ₱{pkg.price}.00
                    </span>

                    <div className="w-full h-px bg-gray-200/60 mb-5"></div>

                    <ul className="w-full space-y-3 text-left mb-2">
                      <li className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-4">Estimated Usage</li>
                      {bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <Check className={`w-5 h-5 shrink-0 ${selectedPackage === pkg.tokens ? "text-indigo-500" : "text-gray-300"}`} strokeWidth={2.5} />
                          <span className={`text-sm font-semibold leading-snug ${selectedPackage === pkg.tokens ? "text-indigo-900" : "text-gray-600"}`}>
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] shrink-0">
          <button
            onClick={handlePurchase}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 text-white font-bold text-lg py-3.5 sm:py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
          >
            {loading ? (
              <span>Preparing GCash...</span>
            ) : (
              <>
                <img src="/gradcoin.svg" alt="GradCoin" className="w-8 h-8 object-contain drop-shadow-md" />
                Purchase {selectedPackage} Coins - ₱{getSelectedPrice()}.00
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenInfoModal;
