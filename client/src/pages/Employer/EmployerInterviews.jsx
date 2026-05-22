import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";

const EmployerInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setLoading] = useState(true);

  const getInterviews = async () => {
    try {
      const response = await axiosInstance.get("/interviews");
      if (response.status === 200) {
        setInterviews(response.data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInterviews();
  }, []);

  return (
    <DashboardLayout activeMenu="employer-interviews">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">
            Candidate Interviews (AI Assessed)
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews.length > 0 ? (
                interviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="relative aspect-video bg-black">
                      <video
                        src={interview.recordingUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {interview.candidateId?.fullName || "Candidate"}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {new Date(interview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div
                          className={`px-2 py-1 rounded-md text-sm font-bold ${
                            interview.aiScore >= 80
                              ? "bg-green-100 text-green-700"
                              : interview.aiScore >= 50
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          Score: {interview.aiScore}
                        </div>
                      </div>
                      <div className="mb-3">
                        <span className="text-xs font-semibold uppercase bg-blue-50 text-blue-600 px-2 py-1 rounded">
                          {interview.difficulty}
                        </span>
                      </div>
                      {interview.aiFeedback && (
                        <div className="mt-auto space-y-2 text-sm text-gray-600">
                          {interview.aiFeedback.strengths && (
                            <div>
                              <strong className="text-gray-800">
                                Strengths:
                              </strong>
                              <ul className="list-disc pl-4 text-xs">
                                {interview.aiFeedback.strengths
                                  .slice(0, 2)
                                  .map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No interviews found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerInterviews;
