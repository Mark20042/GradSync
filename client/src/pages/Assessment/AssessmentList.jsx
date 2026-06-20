import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Trophy,
  Play,
  ArrowLeft,
  Video,
  Briefcase,
  MapPin,
  Building2,
  Award,
  X,
  Eye,
  RefreshCw,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { API_PATH } from "../../utils/apiPath";
import Navbar from "../Graduates/Jobseeker/components/Navbar";


const AssessmentList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [userTokens, setUserTokens] = useState(0);
  const [aiCosts, setAiCosts] = useState({ interview: 20, skillVerification: 1 });
  const [mySubmissions, setMySubmissions] = useState([]);
  const [myInterviews, setMyInterviews] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedInterviewResult, setSelectedInterviewResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch only candidate-specific approved assessments
      const assessRes = await axiosInstance.get("/api/generation/my-assessments");
      setAssessments(assessRes.data || []);
    } catch (error) {
      console.error("Error fetching personalized assessments", error);
    }

    try {
      const userRes = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      setUserSkills(userRes.data.verifiedSkills || []);
      setUserTokens(userRes.data.aiTokens || 0);
      if (userRes.data.systemSettings?.aiCosts) {
        setAiCosts(userRes.data.systemSettings.aiCosts);
      }
    } catch (error) {
      console.error("Error fetching user skills", error);
    }

    try {
      const subRes = await axiosInstance.get("/api/assessments/submissions/me");
      setMySubmissions(subRes.data || []);
    } catch (error) {
      console.error("Error fetching submissions", error);
    }

    try {
      // Fetch candidate-specific tailored interview drafts
      const draftsRes = await axiosInstance.get("/api/generation/my-interviews");
      const draftsAsRoles = (draftsRes.data || []).map(draft => ({
        _id: draft._id,
        roleName: draft._id, // Use ID as roleName for backend lookup
        displayName: "Your Tailored Interview",
        description: "A custom 20-question interview specifically generated for your skills and experience.",
        questions: draft.questions,
        isDraft: true
      }));
      setRoles(draftsAsRoles);
    } catch (error) {
      console.error("Error fetching personalized interviews", error);
    }

    try {
      const intRes = await axiosInstance.get(API_PATH.INTERVIEW.GET_USER_INTERVIEWS);
      setMyInterviews(intRes.data || []);
    } catch (error) {
      console.error("Error fetching user interviews", error);
    }
  };

  const isVerified = (skill) => {
    return userSkills.find((s) => s.skill === skill);
  };

  // Backend patchCategories already assigns correct categories
  // Valid categories: General, Communication, Technical, Behavioral
  const getDisplayCategory = (answer) => answer.category || "General";

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getDisplayCategoryScores = (interview) => {
    if (!interview) return null;
    // Use backend-provided categoryScores if available
    if (interview.aiFeedback?.categoryScores && Object.keys(interview.aiFeedback.categoryScores).length > 0) {
      return interview.aiFeedback.categoryScores;
    }
    // Fallback: calculate from answer categories (already correct from backend)
    if (!interview.answers || interview.answers.length === 0) return null;
    const categoryTotals = {};
    const categoryCounts = {};
    interview.answers.forEach(ans => {
      const c = ans.category || "General";
      if (!categoryTotals[c]) { categoryTotals[c] = 0; categoryCounts[c] = 0; }
      categoryTotals[c] += ans.score || 0;
      categoryCounts[c] += 1;
    });
    const calculated = {};
    Object.keys(categoryTotals).forEach(c => {
      calculated[c] = Math.round(categoryTotals[c] / categoryCounts[c]);
    });
    return Object.keys(calculated).length > 0 ? calculated : null;
  };

  const getDisplayCategoryInterpretation = (interview, scores) => {
    if (!interview || !scores) return null;
    if (interview.aiFeedback?.categoryInterpretation) return interview.aiFeedback.categoryInterpretation;
    let highest = { name: "", score: -1 };
    let lowest = { name: "", score: 101 };
    Object.entries(scores).forEach(([name, score]) => {
      if (score > highest.score) highest = { name, score };
      if (score < lowest.score) lowest = { name, score };
    });
    if (highest.name && lowest.name && highest.name !== lowest.name) {
      if (highest.score >= 80 && lowest.score < 60) {
        return `The candidate excelled remarkably in ${highest.name} but exhibited significant gaps in ${lowest.name}.`;
      } else if (highest.score - lowest.score >= 15) {
        return `The candidate is strongest in ${highest.name} but lacks slightly in ${lowest.name}.`;
      }
    }
    return `The candidate showed a balanced performance across all evaluated areas.`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Navbar />
      <div className="px-4 md:px-6 py-4 mt-20 max-w-6xl mx-auto">
        <button
          onClick={() => navigate("/find-jobs")}
          className="flex items-center gap-2 text-blue-500 font-semibold py-2 rounded-lg transition-all hover:text-blue-700 w-fit"
        >
          <ArrowLeft size={18} />
          Back to Find Jobs
        </button>
      </div>

      <div className="px-4 md:px-6 pb-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-blue-500 p-6 md:p-10 rounded-2xl text-white mb-8 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]">
          <div className="flex items-start md:items-center gap-3 mb-3 md:mb-2 flex-col md:flex-row">
            <Trophy size={28} className="text-yellow-300 hidden md:block" />
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
              <Trophy size={24} className="text-yellow-300 md:hidden" />
              Skill & Interview Center
            </h1>
          </div>
          <p className="text-sm md:text-base text-white/90">
            Earn verified badges and practice with our AI interviewer to stand
            out to employers.
          </p>
        </div>

        {/* Mock Interviewer Section */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
          <Video size={24} className="text-purple-500" />
          AI Practice Interviewer
        </h2>



        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {roles.map((role) => {
            // Check if the user has already completed this interview
            const completedInterview = myInterviews.find(i => i.roleName === role.roleName || i.roleName === role.displayName);

            return (
              <div
                key={role._id}
                className={`bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 relative hover:-translate-y-1 hover:shadow-lg hover:border-blue-500`}
              >
                {completedInterview && (
                  <div className="absolute top-4 right-4 flex flex-col items-center gap-1 z-10">
                    <CheckCircle size={28} className="text-green-500" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInterviewResult(completedInterview);
                      }}
                      className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full mt-0.5 transition-colors font-medium border border-blue-100"
                      title="View Results"
                    >
                      <Eye size={12} /> Results
                    </button>
                  </div>
                )}

                <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                  <Briefcase size={24} className="text-purple-500" />
                </div>

                <div className="flex-1 pr-12">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center justify-between">
                    <span>{role.displayName || role.roleName}</span>
                  </h4>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    {role.questions?.length || 0} Questions Available
                  </p>
                  {role.description && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {role.description}
                    </p>
                  )}
                </div>
                </div>

                <button
                  onClick={() => {
                    if (userTokens < aiCosts.interview) {
                      window.dispatchEvent(new CustomEvent("openTokenModal"));
                      return;
                    }
                    navigate("/interview-room", { state: { jobRole: role.roleName } });
                  }}
                  className={`w-full py-3 mt-4 rounded-lg font-bold flex items-center justify-center gap-2 ${
                    userTokens < aiCosts.interview
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {completedInterview ? (
                    <>
                      <RefreshCw size={16} /> Retake Interview <span className="flex items-center gap-1 ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full"><img src="/gradcoin.svg" alt="GradCoin" className="w-4 h-4 object-contain" /> {aiCosts.interview}</span>
                    </>
                  ) : (
                    <>
                      <Play size={16} /> Take Interview <span className="flex items-center gap-1 ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full"><img src="/gradcoin.svg" alt="GradCoin" className="w-4 h-4 object-contain" /> {aiCosts.interview}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
          {roles.length === 0 && (
            <p className="text-gray-500 py-4 col-span-full">
              No interview roles available yet. Please check back later.
            </p>
          )}
        </div>

        <hr className="border-0 h-px bg-gray-200 my-10" />



        {/* Skill Assessments Section */}
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          Skill Assessments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {assessments.length > 0 ? (
            assessments.map((assessment) => {
              const verified = isVerified(assessment.skill);

              return (
                <div
                  key={assessment._id}
                  className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 relative hover:-translate-y-1 hover:shadow-lg hover:border-blue-500"
                >
                  {verified && (
                    <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
                      <CheckCircle size={28} className="text-green-500" />
                      <button
                        onClick={() => {
                          const submission = mySubmissions.find(s => s.assessment?._id === assessment._id);
                          if (submission) setSelectedSubmission(submission);
                        }}
                        className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-full mt-0.5 transition-colors font-medium border border-blue-100"
                        title="View Results"
                      >
                        <Eye size={12} /> Results
                      </button>
                    </div>
                  )}
                  <h3 className="font-bold text-lg mb-2 pr-16 capitalize">
                    {assessment.skill}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {assessment.timeLimit || 15} mins • {assessment.questions?.length || 0} questions
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    Pass: {assessment.passingScore || 80}%
                  </p>
                  <button
                    onClick={() => {
                      if (userTokens < aiCosts.skillVerification) {
                        window.dispatchEvent(new CustomEvent("openTokenModal"));
                        return;
                      }
                      navigate("/assessment-taking", {
                        state: {
                          assessmentId: assessment._id,
                          skill: assessment.skill,
                        },
                      });
                    }}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${
                      userTokens < aiCosts.skillVerification ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {verified ? (
                      <>
                        <RefreshCw size={16} /> Retake Assessment <span className="flex items-center gap-1 ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full"><img src="/gradcoin.svg" alt="GradCoin" className="w-4 h-4 object-contain" /> {aiCosts.skillVerification}</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} /> Take Assessment <span className="flex items-center gap-1 ml-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-full"><img src="/gradcoin.svg" alt="GradCoin" className="w-4 h-4 object-contain" /> {aiCosts.skillVerification}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 col-span-full text-center py-8">
              No assessments available yet. Check back soon!
            </p>
          )}
        </div>
      </div>

      {selectedSubmission && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedSubmission(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900 capitalize">
                {selectedSubmission.assessment?.skill || "Assessment"} Results
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-fit transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                <div className="w-full sm:flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-xs md:text-sm font-bold text-blue-600 mb-1 uppercase tracking-wider">Score</p>
                  <p className="text-2xl md:text-3xl font-black text-blue-700">{Math.round(selectedSubmission.score)}%</p>
                </div>
                <div className={`w-full sm:flex-1 border rounded-xl p-4 text-center flex flex-col items-center justify-center ${selectedSubmission.passed ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <p className={`text-xs md:text-sm font-bold mb-1 uppercase tracking-wider ${selectedSubmission.passed ? 'text-green-600' : 'text-red-600'}`}>Status</p>
                  <div className={`flex items-center justify-center gap-2 text-xl font-bold capitalize ${selectedSubmission.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedSubmission.passed ? <><CheckCircle size={22} /> Passed</> : <><X size={22} /> Failed</>}
                  </div>
                </div>
              </div>

              {selectedSubmission.categoryScores && Object.keys(selectedSubmission.categoryScores).length > 0 && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-xl border border-indigo-100 shadow-sm">
                  <h4 className="text-sm font-bold text-indigo-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Category Performance
                  </h4>
                  <div className="flex flex-wrap gap-3 mb-4">
                    {Object.entries(selectedSubmission.categoryScores).map(([cat, score]) => (
                      <div key={cat} className="bg-white px-3 py-2 rounded-lg shadow-sm border border-indigo-50 flex items-center gap-3 text-sm flex-1 min-w-[140px] justify-between">
                        <span className="font-semibold text-indigo-900">{cat}</span>
                        <span className={`font-bold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {Math.round(score)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {selectedSubmission.categoryInterpretation && (
                    <div className="bg-white/60 p-3 rounded-lg border border-indigo-50">
                      <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                        💡 {selectedSubmission.categoryInterpretation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Questions Review Section */}
              {selectedSubmission.assessment?.questions && selectedSubmission.answers && (
                <div className="mt-8 space-y-6">
                  <h4 className="text-lg font-bold text-gray-900 border-b pb-2">Questions Review</h4>
                  {selectedSubmission.assessment.questions.map((q, index) => {
                    const userAnswer = selectedSubmission.answers.find(a => a.questionId === q._id);
                    let isCorrect = false;
                    if (userAnswer) {
                      if (q.type === 'identification') {
                        isCorrect = userAnswer.selectedOption.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                      } else {
                        isCorrect = userAnswer.selectedOption.trim() === q.correctAnswer.trim();
                      }
                    }

                    return (
                      <div key={q._id || index} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {isCorrect ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <X className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-2">
                              {index + 1}. {q.questionText}
                            </p>

                            {q.codeSnippet && (
                              <div className="bg-slate-900 text-slate-50 p-4 rounded-lg my-3 font-mono text-sm overflow-x-auto whitespace-pre">
                                {q.codeSnippet}
                              </div>
                            )}

                            <div className="mb-3 text-sm">
                              <p className="text-gray-600 mb-1">
                                Your Answer: <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {userAnswer?.selectedOption || 'Not answered'}
                                </span>
                              </p>
                              {!isCorrect && (
                                <p className="text-gray-600">
                                  Correct Answer: <span className="font-medium text-green-600">
                                    {q.correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>

                            {q.explanation && (
                              <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-3 text-sm">
                                <p className="font-semibold text-blue-900 mb-1">Explanation:</p>
                                <p className="text-blue-800">{q.explanation}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interview Result Modal */}
      {selectedInterviewResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelectedInterviewResult(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-xl font-bold text-gray-900 m-0">Interview Results</h3>
                <p className="text-sm text-gray-500 m-0 mt-1">
                  Role: <span className="font-semibold text-gray-700">{selectedInterviewResult.roleName || "General"}</span> • Score: <span className={`font-bold ${getScoreColor(selectedInterviewResult.aiScore)} px-2 py-0.5 rounded-full`}>{selectedInterviewResult.aiScore}/100</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedInterviewResult(null)}
                className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div className="mb-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-bold text-gray-900 mb-2">
                  AI Feedback Summary
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {selectedInterviewResult.aiFeedback?.summary || "No summary available."}
                </p>

                {getDisplayCategoryScores(selectedInterviewResult) && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Category Performance</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {Object.entries(getDisplayCategoryScores(selectedInterviewResult)).map(([cat, score]) => (
                        <div key={cat} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 truncate">{cat}</p>
                          <p className={`text-lg font-extrabold ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-blue-600' : score >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {score}<span className="text-xs text-gray-400 font-medium">/100</span>
                          </p>
                        </div>
                      ))}
                    </div>
                    {getDisplayCategoryInterpretation(selectedInterviewResult, getDisplayCategoryScores(selectedInterviewResult)) && (
                      <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded-lg font-medium border border-indigo-100 leading-relaxed">
                        💡 {getDisplayCategoryInterpretation(selectedInterviewResult, getDisplayCategoryScores(selectedInterviewResult))}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <h4 className="text-[0.7rem] font-bold text-gray-400 mb-3 uppercase tracking-widest px-1">
                Per-Question Breakdown ({selectedInterviewResult.answers?.length || 0} questions)
              </h4>
              <div className="flex flex-col gap-4">
                {selectedInterviewResult.answers?.map((answer, idx) => {
                  const displayCat = getDisplayCategory(answer);
                  return (
                    <div key={idx} className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm transition-all hover:border-blue-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3 md:gap-4">
                        <p className="font-bold text-gray-800 text-sm flex-1 leading-snug">
                          {displayCat && (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] uppercase tracking-widest rounded-md font-bold mr-2 mb-1 align-bottom">
                              {displayCat}
                            </span>
                          )}
                          Q{idx + 1}: {answer.questionText}
                        </p>
                      <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-[0.7rem] shrink-0 self-start sm:self-auto ${getScoreColor(answer.score)}`}>
                        {answer.score}/100
                      </span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                      <p className="text-[0.8rem] text-gray-600 leading-relaxed italic m-0">
                        <strong className="text-gray-500 not-italic mr-2">Your Answer:</strong> 
                        {answer.candidateAnswer || <em className="text-gray-300">No answer</em>}
                      </p>
                    </div>
                    <p className="text-[0.8rem] text-gray-700 leading-relaxed m-0">
                      <strong className="text-gray-900 mr-2">Feedback:</strong> {answer.feedback}
                    </p>
                  </div>
                  );
                })}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedInterviewResult(null)}
                className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Close Results
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssessmentList;
