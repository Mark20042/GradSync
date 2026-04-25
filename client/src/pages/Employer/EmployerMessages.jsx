import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // Import useNavigate and useLocation
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  MessageSquare,
  Briefcase,
  Users,
  Inbox,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Import motion
import { JobListPanel, ApplicantListPanel } from "./EmployerChatPanels";
import EmployerChatWindow from "./EmployerChatWindow";

const EmployerMessages = () => {
  const { user } = useAuth();
  const navigate = useNavigate(); // Initialize navigate
  const location = useLocation(); // Initialize location
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State to manage selection
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedConvo, setSelectedConvo] = useState(null);

  // Fetch all conversations for the employer
  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(
            API_PATH.CHAT.GET_CONVERSATIONS
          );
          setConversations(response.data);
        } catch (error) {
          console.error("Error fetching conversations:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchConversations();
    }
  }, [user]);

  // Handle navigation from Applicant Profile or Notifications
  useEffect(() => {
    if (location.state?.conversationId && conversations.length > 0) {
      const { conversationId } = location.state;

      // Find the conversation
      const convo = conversations.find(c => c._id === conversationId);

      if (convo) {
        // Find jobId either from convo object, or state
        const jobId = convo.job?._id || convo.job || location.state?.jobId;
        if (jobId) {
          setSelectedJobId(jobId);
        }
        setSelectedConvo(convo);
      }
    }
  }, [conversations, location.state]);

  // This is the key logic to group conversations by job
  const conversationsByJob = useMemo(() => {
    const grouped = new Map();
    conversations.forEach((convo) => {
      // Ensure job exists before trying to access _id
      if (convo.job && convo.job._id) {
        const jobId = convo.job._id;
        if (!grouped.has(jobId)) {
          grouped.set(jobId, {
            jobDetails: convo.job,
            convos: [],
          });
        }
        grouped.get(jobId).convos.push(convo);
      }
    });
    return grouped;
  }, [conversations]);

  // Get the list of conversations for the currently selected job
  const convosForSelectedJob =
    conversationsByJob.get(selectedJobId)?.convos || [];

  // --- MODIFIED HANDLER ---
  // This now *only* selects a job.
  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setSelectedConvo(null); // Reset chat window when job changes
  };

  // --- NEW HANDLER ---
  // This handles going back to the job list
  const handleBackToJobs = () => {
    setSelectedJobId(null);
    setSelectedConvo(null);
  };

  // Handle clicking an applicant
  const handleSelectConvo = (convo) => {
    setSelectedConvo(convo);
  };

  // Animation variants for the sliding panels
  const panelVariants = {
    initial: { x: "100%" },
    animate: { x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { x: "-100%", transition: { duration: 0.3, ease: "easeOut" } },
  };

  const jobListVariants = {
    initial: { x: 0 },
    animate: { x: 0 },
    exit: { x: "-100%", transition: { duration: 0.3, ease: "easeOut" } },
  };

  if (loading) {
    return (
      <DashboardLayout activeMenu="messages">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeMenu="messages">
      <div className="h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="mb-6 flex-none">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-500 text-sm">Manage your job applications and messages</p>
        </div>

        {/* Main Chat Container */}
        <div className="flex-1 bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative flex flex-col">
          <AnimatePresence mode="wait">
            {!selectedJobId ? (
              // --- View 1: Job List ---
              <motion.div
                key="job-list"
                className="absolute inset-0 w-full h-full flex flex-col"
                variants={jobListVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex-none p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                  <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Job Postings</h2>
                    <p className="text-xs text-gray-500 font-medium">Select a job to view applicants</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-gray-50/30">
                  <JobListPanel
                    conversationsByJob={conversationsByJob}
                    selectedJobId={selectedJobId}
                    onSelectJob={handleSelectJob}
                  />
                </div>
              </motion.div>
            ) : (
              // --- View 2: Applicant & Chat View ---
              <motion.div
                key="chat-view"
                className="absolute inset-0 w-full h-full flex"
                variants={panelVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                {/* Panel 2: Applicant List (30% width) */}
                <div className="w-[350px] border-r border-gray-100 bg-white flex flex-col">
                  <div className="flex-none p-4 border-b border-gray-100 flex items-center gap-3">
                    <button
                      onClick={handleBackToJobs}
                      className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all"
                      title="Back to Jobs"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">Applicants</h2>
                      <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">
                        {conversationsByJob.get(selectedJobId)?.jobDetails?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <ApplicantListPanel
                      conversations={convosForSelectedJob}
                      selectedConvoId={selectedConvo?._id}
                      onSelectConvo={handleSelectConvo}
                    />
                  </div>
                </div>

                {/* Panel 3: Chat Window (70% width) */}
                <div className="flex-1 flex flex-col bg-gray-50/50 min-w-0">
                  {selectedConvo ? (
                    <EmployerChatWindow
                      key={selectedConvo._id}
                      conversation={selectedConvo}
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-500">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-6">
                        <MessageSquare className="w-10 h-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Select an Applicant</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">
                        Choose an applicant from the list to start messaging or view their application details.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerMessages;
