import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Trophy,
  XCircle,
  Calendar,
  ShieldCheck,
  Mail,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { getBadgeComponent } from "../../components/Badges/SkillBadges";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import PreAssessmentAgreement from "./components/PreAssessmentAgreement";
import InstructionsScreen from "./components/InstructionsScreen";
import { showIntegrityWarningToast } from "../../utils/toastUtils";


const AssessmentTaking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessmentId, skill } = location.state || {};

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // New states for security
  const [showAgreement, setShowAgreement] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [violations, setViolations] = useState([]);

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!assessmentId) {
      navigate("/assessments");
      return;
    }
    fetchAssessment();
  }, [assessmentId]);

  // Violation detection
  useEffect(() => {
    if (!hasStarted || isSubmitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("tab-switch");
      }
    };

    const handleBlur = () => {
      recordViolation("window-blur");
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      recordViolation("right-click");
    };

    const handleCopy = (e) => {
      e.preventDefault();
      recordViolation("copy-paste");
    };

    const handlePaste = (e) => {
      e.preventDefault();
      recordViolation("copy-paste");
    };

    const handleKeyDown = (e) => {
      // Detect DevTools shortcuts
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        e.key === "F12"
      ) {
        e.preventDefault();
        recordViolation("devtools");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasStarted, isSubmitted]);

  useEffect(() => {
    if (assessment && hasStarted && !isSubmitted) {
      startTimeRef.current = Date.now();
      setTimeLeft(assessment.timeLimit * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [assessment, hasStarted, isSubmitted]);

  const recordViolation = (type) => {
    if (isSubmitted) return;
    
    setViolations((prev) => {
      const newViolation = {
        type,
        timestamp: new Date().toISOString(),
        questionIndex: currentIndex,
      };
      return [...prev, newViolation];
    });

    showIntegrityWarningToast();
  };

  const handleAgreementAccept = () => {
    setShowAgreement(false);
    setShowInstructions(true);
  };

  const handleInstructionsStart = () => {
    setShowInstructions(false);
    setHasStarted(true);
  };

  const handleCancel = () => {
    navigate("/assessments");
  };

  const fetchAssessment = async () => {
    try {
      const res = await axiosInstance.get(
        `/api/assessments/detail/${assessmentId}`,
      );
      
      const assessmentData = res.data;
      
      // Group by category and shuffle questions within each category
      if (assessmentData.questions && assessmentData.questions.length > 0) {
        const groupedQuestions = {};
        assessmentData.questions.forEach(q => {
          const cat = q.category || "General";
          if (!groupedQuestions[cat]) groupedQuestions[cat] = [];
          groupedQuestions[cat].push(q);
        });

        const sortedCategories = Object.keys(groupedQuestions).sort();
        let shuffledGroupedQuestions = [];
        
        sortedCategories.forEach(cat => {
          const shuffledInCategory = [...groupedQuestions[cat]].sort(() => Math.random() - 0.5);
          shuffledGroupedQuestions = [...shuffledGroupedQuestions, ...shuffledInCategory];
        });

        assessmentData.questions = shuffledGroupedQuestions;

        // Shuffle options for each question
        assessmentData.questions = assessmentData.questions.map(q => {
          if (q.options && q.options.length > 0) {
            return {
              ...q,
              options: [...q.options].sort(() => Math.random() - 0.5)
            };
          }
          return q;
        });
      }

      setAssessment(assessmentData);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch assessment", error);
      navigate("/assessments");
    }
  };

  const handleOptionSelect = (option) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [assessment.questions[currentIndex]._id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < assessment.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async (forcedByViolation = false) => {
    if (isSubmitted) return;
    clearInterval(timerRef.current);

    const formattedAnswers = Object.entries(answers).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }),
    );

    const submissionData = {
      skill: assessment.skill,
      answers: formattedAnswers,
      violations: violations,
      violationCount: violations.length,
      timeSpent: startTimeRef.current
        ? Math.floor((Date.now() - startTimeRef.current) / 1000)
        : 0,
    };

    try {
      const res = await axiosInstance.post(
        "/api/assessments/submit",
        submissionData,
      );
      setResult(res.data);
      setIsSubmitted(true);

      if (res.data.passed) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
        toast.success("Congratulations! You passed!");
        // Send certificate and result via email (API call placeholder)
        try {
          await axiosInstance.post("/api/assessments/send-certificate", {
            assessmentId,
            result: res.data,
          });
        } catch (err) {
          // Optionally show a toast or log error
          console.error("Failed to send certificate email", err);
        }
      } else {
        toast.error("Assessment completed. Better luck next time!");
      }
    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Failed to submit assessment");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden quiz-page-wrapper">
        <style>{`
                  .quiz-page-wrapper::before {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    top: -50%;
                    left: -50%;
                    z-index: 0;
                    background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
                    animation: rotate 60s linear infinite;
                  }
                  @keyframes rotate {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                  }
                `}</style>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 z-10"></div>
      </div>
    );
  }

  // Show Agreement Page
  if (showAgreement && assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-6xl mx-auto">
          <PreAssessmentAgreement
            assessment={assessment}
            onAgree={handleAgreementAccept}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  // Show Instructions Page
  if (showInstructions && assessment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-6xl mx-auto">
          <InstructionsScreen
            assessment={assessment}
            onStart={handleInstructionsStart}
            onCancel={handleCancel}
          />
        </div>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden quiz-page-wrapper">
        <style>{`
          .quiz-page-wrapper::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            top: -50%;
            left: -50%;
            z-index: 0;
            background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.08) 0%, transparent 50%);
            animation: rotate 60s linear infinite;
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-fade-in {
            animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .glow-effect {
            box-shadow: 0 0 30px rgba(59, 130, 246, 0.2);
          }
        `}</style>

        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] p-10 text-center relative z-10 animate-fade-in border border-slate-100">
          {/* Big Premium Icon Container */}
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20 relative group overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Trophy size={48} className="text-white animate-bounce" style={{ animationDuration: '3s' }} />
          </div>

          <h1 className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 mb-3">
            Assessment Submitted!
          </h1>

          <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed mb-8">
            Great job! Your assessment has been recorded. Our administrators will verify your submission and send your certificate via email upon approval.
          </p>

          {/* Premium Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Date Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                Submitted On
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Status Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <ShieldCheck size={20} className="text-amber-600" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                Review Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                Pending Review
              </span>
            </div>

            {/* Delivery Card */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center hover:scale-[1.02] transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mb-2">
                <Mail size={20} className="text-indigo-600" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">
                Certificate
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                Registered Email
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => navigate("/assessments")}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group cursor-pointer"
          >
            Return to Skill Center
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = assessment.questions[currentIndex];
  const progress = ((currentIndex + 1) / assessment.questions.length) * 100;
  const isLastQuestion = currentIndex === assessment.questions.length - 1;

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden quiz-page-wrapper">
        <style>{`
              .quiz-page-wrapper::before {
                content: '';
                position: absolute;
                width: 200%;
                height: 200%;
                top: -50%;
                left: -50%;
                z-index: 0;
                background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
                animation: rotate 60s linear infinite;
              }
              @keyframes rotate {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              .animate-fade-in {
                animation: fadeIn 0.5s ease-out forwards;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>

        <div className="bg-white w-full max-w-[900px] min-h-[600px] rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] flex flex-col relative z-10 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-8 py-6 bg-white border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {assessment.title}
              </h1>
              <p className="text-gray-500 text-sm">
                {assessment.difficulty} Level
              </p>
            </div>
            <div className="flex items-center gap-4">

              {/* Timer */}
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold tabular-nums transition-colors ${timeLeft < 60 ? "bg-red-100 text-red-500" : "bg-blue-50 text-blue-500"}`}
              >
                <Clock size={16} />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-1.5 w-full bg-gray-100">
            <div
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-10 overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                Question {currentIndex + 1} of {assessment.questions.length}
              </span>
              {currentQuestion.category && (
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  {currentQuestion.category}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
              {currentQuestion.questionText}
            </h2>

            {currentQuestion.codeSnippet && (
              <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg overflow-x-auto font-mono text-sm mb-6">
                {currentQuestion.codeSnippet}
              </pre>
            )}

            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question Reference"
                className="max-h-64 object-contain mb-6 rounded-lg border border-gray-200"
              />
            )}

            {currentQuestion.type === 'identification' ? (
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion._id] || ""}
                  onChange={(e) => handleOptionSelect(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-lg font-medium text-gray-800 transition-all"
                  autoComplete="off"
                />
              </div>
            ) : (
              <div className="grid gap-4">
                {currentQuestion.options.filter(opt => opt && opt.trim() !== "").map((option, index) => {
                  const isSelected = answers[currentQuestion._id] === option;
                  return (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option)}
                      className={`text-left p-5 rounded-xl border-2 font-medium transition-all flex items-center gap-4 hover:border-blue-500 hover:bg-slate-50 ${isSelected ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 bg-white text-gray-700"}`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-transparent"}`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={16} /> Previous
            </button>
            {isLastQuestion ? (
              <button
                onClick={() => handleSubmit(false)}
                disabled={
                  Object.keys(answers).length < assessment.questions.length
                }
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Submit Assessment <CheckCircle size={16} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion._id]}
                className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Next Question <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AssessmentTaking;
