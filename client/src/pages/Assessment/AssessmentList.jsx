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
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { API_PATH } from "../../utils/apiPath";
import Navbar from "../JobSeeker/components/Navbar";
import {
  EntryBadge,
  MidBadge,
  SeniorBadge,
  ExpertBadge,
  getBadgeComponent,
} from "../../components/Badges/SkillBadges";

const AssessmentList = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const assessRes = await axiosInstance.get("/api/assessments");
      setAssessments(assessRes.data || []);
    } catch (error) {
      console.error("Error fetching assessments", error);
    }

    try {
      const userRes = await axiosInstance.get(API_PATH.AUTH.GET_PROFILE);
      setUserSkills(userRes.data.verifiedSkills || []);
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
      const rolesRes = await axiosInstance.get(API_PATH.INTERVIEW.GET_ROLES);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error("Error fetching interview roles", error);
    }
  };

  const isVerified = (skill) => {
    return userSkills.find((s) => s.skill === skill);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="px-6 py-4 mt-20 ml-90">
        <button
          onClick={() => navigate("/find-jobs")}
          className="flex items-center gap-2 text-blue-500 font-semibold px-4 py-2 rounded-lg transition-all hover:bg-blue-50"
        >
          <ArrowLeft size={18} />
          Back to Find Jobs
        </button>
      </div>

      <div className="px-6 pb-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-blue-900 to-blue-500 p-10 rounded-2xl text-white mb-8 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.5)]">
          <div className="flex items-center gap-3 mb-2">
            <Trophy size={28} className="text-yellow-300" />
            <h1 className="text-3xl font-extrabold mb-3">
              Skill & Interview Center
            </h1>
          </div>
          <p className="text-base text-white/90">
            Earn verified badges and practice with our AI interviewer to stand
            out to employers.
          </p>
        </div>

        {/* Mock Interviewer Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
          <Video size={24} className="text-purple-500" />
          AI Practice Interviewer
        </h2>

        <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
            Select Role
          </span>
          Choose a practice interview job role to begin practicing.
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {roles.map((role) => (
            <div
              key={role._id}
              onClick={() =>
                navigate("/interview-room", {
                  state: { jobRole: role.roleName },
                })
              }
              className="bg-white rounded-xl border-2 border-gray-200 p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:border-blue-500 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                <Briefcase size={24} className="text-purple-500" />
              </div>

              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">
                  {role.roleName}
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
          ))}
          {roles.length === 0 && (
            <p className="text-gray-500 py-4 col-span-full">
              No interview roles available yet. Please check back later.
            </p>
          )}
        </div>

        <hr className="border-0 h-px bg-gray-200 my-10" />

        {/* Badge Legend */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-indigo-100 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy size={22} className="text-yellow-500" />
            Skill Badge Levels
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-green-200">
              <EntryBadge size={28} />
              <div>
                <div className="font-bold text-sm text-gray-900">Entry</div>
                <div className="text-xs text-gray-500">Beginner</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-blue-200">
              <MidBadge size={28} />
              <div>
                <div className="font-bold text-sm text-gray-900">Mid</div>
                <div className="text-xs text-gray-500">Intermediate</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-purple-200">
              <SeniorBadge size={28} />
              <div>
                <div className="font-bold text-sm text-gray-900">Senior</div>
                <div className="text-xs text-gray-500">Advanced</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-2 border-orange-200">
              <ExpertBadge size={28} />
              <div>
                <div className="font-bold text-sm text-gray-900">Expert</div>
                <div className="text-xs text-gray-500">Master</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Assessments Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center gap-3">
          <Trophy size={24} className="text-yellow-500" />
          Skill Assessments
        </h2>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {assessments.length > 0 ? (
            assessments.map((assessment) => {
              const verified = isVerified(assessment.skill);
              const BadgeComponent = verified
                ? getBadgeComponent(verified.level)
                : null;

              return (
                <div
                  key={assessment._id}
                  className="bg-white rounded-xl border border-gray-200 p-6 transition-all duration-300 relative hover:-translate-y-1 hover:shadow-lg hover:border-blue-500"
                >
                  {verified && BadgeComponent && (
                    <div className="absolute top-4 right-4 flex flex-col items-center gap-1">
                      <BadgeComponent size={32} />
                      <span className="text-xs font-bold text-gray-600">
                        {verified.level}
                      </span>
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
                  <h3 className="font-bold text-lg mb-2 pr-16">
                    {assessment.skill}
                  </h3>
                  <p className="text-gray-500 text-sm mb-2">
                    {assessment.difficulty} • {assessment.timeLimit || 15} mins
                  </p>
                  <p className="text-gray-400 text-xs mb-4">
                    Pass: {assessment.passingScore || 80}% •{" "}
                    {assessment.questions?.length || 0} questions
                  </p>
                  <button
                    onClick={() => {
                      if (verified) {
                        const submission = mySubmissions.find(s => s.assessment?._id === assessment._id);
                        if (submission) {
                          setSelectedSubmission(submission);
                        }
                      } else {
                        navigate("/assessment-taking", {
                          state: {
                            assessmentId: assessment._id,
                            skill: assessment.skill,
                          },
                        });
                      }
                    }}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 ${verified
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                  >
                    {verified ? (
                      "✓ Verified"
                    ) : (
                      <>
                        <Play size={16} /> Take Assessment
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedSubmission.assessment?.skill || "Assessment"} Results
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-fit transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-blue-600 mb-1 uppercase tracking-wider">Score</p>
                  <p className="text-3xl font-black text-blue-700">{selectedSubmission.score}%</p>
                </div>
                <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-sm font-bold text-green-600 mb-1 uppercase tracking-wider">Status</p>
                  <p className="text-xl font-bold text-green-700 capitalize">Verified</p>
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
                          {score}%
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AssessmentList;
