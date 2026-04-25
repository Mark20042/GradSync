import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clock, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, Trophy, XCircle } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { getBadgeComponent } from "../../components/Badges/SkillBadges";
import confetti from "canvas-confetti";

const Quiz = () => {
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

    const timerRef = useRef(null);

    useEffect(() => {
        if (!assessmentId) {
            navigate('/skill-center');
            return;
        }
        fetchAssessment();
    }, [assessmentId]);

    useEffect(() => {
        if (assessment && !isSubmitted) {
            setTimeLeft(assessment.timeLimit * 60);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
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
    }, [assessment, isSubmitted]);

    const fetchAssessment = async () => {
        try {
            const res = await axiosInstance.get(`/api/assessments/detail/${assessmentId}`);
            setAssessment(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch assessment", error);
            navigate('/skill-center');
        }
    };

    const handleOptionSelect = (option) => {
        if (isSubmitted) return;
        setAnswers(prev => ({
            ...prev,
            [assessment.questions[currentIndex]._id]: option
        }));
    };

    const handleNext = () => {
        if (currentIndex < assessment.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (isSubmitted) return;
        clearInterval(timerRef.current);

        const formattedAnswers = Object.entries(answers).map(([questionId, selectedOption]) => ({
            questionId,
            selectedOption
        }));

        try {
            const res = await axiosInstance.post('/api/assessments/submit', {
                skill: assessment.skill,
                answers: formattedAnswers
            });
            setResult(res.data);
            setIsSubmitted(true);

            if (res.data.passed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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

    if (isSubmitted && result) {
        const BadgeIcon = getBadgeComponent(assessment.difficulty);

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
                  .animate-fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                  }
                  @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                  }
                `}</style>

                <button
                    onClick={() => navigate('/skill-center')}
                    className="absolute top-6 left-6 z-50 bg-white border border-gray-200 shadow-md font-bold text-gray-700 py-3 px-6 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Skill Center
                </button>

                <div className="w-[95%] max-w-[1000px] min-h-[650px] bg-[#fffbf0] border-8 border-double border-amber-700 p-2 shadow-2xl relative overflow-hidden z-10 animate-fade-in">
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-700 m-5"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-700 m-5"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-700 m-5"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-700 m-5"></div>

                    <div className="border border-gray-200 bg-white p-8 pb-32 h-full w-full relative flex flex-col items-center justify-center text-center">

                        <div className="text-center mb-4">
                            <Trophy size={40} className={`mx-auto mb-2 ${result.passed ? "text-amber-700" : "text-gray-500"} opacity-90`} />
                            <h1 className={`font-serif text-4xl m-0 uppercase tracking-widest leading-none ${result.passed ? 'text-amber-900' : 'text-gray-700'}`}>
                                {result.passed ? "Certificate" : "Assessment Result"}
                            </h1>
                            <span className={`font-serif text-base italic block mt-2 ${result.passed ? 'text-amber-700' : 'text-gray-500'}`}>
                                {result.passed ? "of Achievement" : "Report"}
                            </span>
                        </div>

                        <div className="text-center mb-6 relative z-10">
                            <p className="text-base text-gray-500 mb-2 italic">
                                {result.passed ? "This is to certify that" : "This report acknowledges that"}
                            </p>

                            <h2 className="font-['Great_Vibes'] text-6xl text-blue-900 mb-4 leading-tight px-5 drop-shadow-sm">
                                {result.candidateName || "Valued Job Seeker"}
                            </h2>

                            <p className="text-base text-gray-500 mb-4 italic">
                                {result.passed ? "has successfully verified their skill in" : "has completed the assessment for"}
                            </p>

                            <h2 className={`text-3xl font-extrabold mb-2 tracking-tight ${result.passed ? 'bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 bg-clip-text text-transparent' : 'text-gray-700'}`}>
                                {assessment.skill} Fundamentals
                            </h2>
                            <p className="text-lg text-gray-600 font-medium">
                                Level: <span className="text-black font-bold">{assessment.difficulty}</span>
                            </p>
                        </div>

                        <div className="flex justify-center gap-12 mb-12">
                            <div className="text-center">
                                <span className="block text-sm text-gray-400 uppercase tracking-widest mb-1">Score</span>
                                <span className={`text-3xl font-extrabold ${result.passed ? (result.score >= assessment.passingScore ? 'text-emerald-600' : 'text-red-600') : 'text-red-600'}`}>
                                    {Math.round(result.score)}%
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="block text-sm text-gray-400 uppercase tracking-widest mb-1">Date</span>
                                <span className="text-lg font-semibold text-gray-700 block mt-1">
                                    {new Date().toLocaleDateString()}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="block text-sm text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                <span className={`text-sm font-bold px-4 py-1.5 rounded-full inline-block mt-1 ${result.passed ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                    {result.passed ? 'VERIFIED' : 'FAILED'}
                                </span>
                            </div>
                        </div>

                        {result.passed && BadgeIcon && (
                            <div className="absolute right-8 bottom-8 opacity-90 -rotate-12">
                                <div className="relative w-24 h-24 bg-amber-700 rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(180,83,9,0.2)] border-4 border-dashed border-amber-50">
                                    <BadgeIcon size={50} color="white" />
                                </div>
                            </div>
                        )}

                        <div className="absolute bottom-10 left-12 text-center z-20">
                            <div className="inline-block border-t-2 border-amber-700 pt-3 px-10">
                                <span className="font-['Great_Vibes'] text-4xl text-amber-900 block mb-1 leading-none">
                                    Mark Joseph Potot
                                </span>
                                <span className="font-serif text-sm text-amber-700 uppercase tracking-widest block font-bold">
                                    CTO
                                </span>
                            </div>
                        </div>

                        {!result.passed && (
                            <div className="absolute bottom-6 right-6">
                                <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors text-sm">
                                    Try Again
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = assessment.questions[currentIndex];
    const progress = ((currentIndex + 1) / assessment.questions.length) * 100;
    const isLastQuestion = currentIndex === assessment.questions.length - 1;

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
                        <h1 className="text-xl font-bold text-gray-900">{assessment.title}</h1>
                        <p className="text-gray-500 text-sm">{assessment.difficulty} Level</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold tabular-nums transition-colors ${timeLeft < 60 ? 'bg-red-100 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                        <Clock size={16} />
                        {formatTime(timeLeft)}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100">
                    <div className="h-full bg-blue-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-10 overflow-y-auto flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                            Question {currentIndex + 1} of {assessment.questions.length}
                        </span>
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

                    <div className="grid gap-4">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = answers[currentQuestion._id] === option;
                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(option)}
                                    className={`text-left p-5 rounded-xl border-2 font-medium transition-all flex items-center gap-4 hover:border-blue-500 hover:bg-slate-50 ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 bg-white text-gray-700'}`}
                                >
                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </button>
                            );
                        })}
                    </div>
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
                            onClick={handleSubmit}
                            disabled={Object.keys(answers).length < assessment.questions.length}
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
    );
};

export default Quiz;
