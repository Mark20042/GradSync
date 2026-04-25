import React from "react";
import moment from "moment";
import { User, Inbox, Briefcase } from "lucide-react";
import { motion } from "framer-motion";

// --- Panel 1: List of Jobs ---
export const JobListPanel = ({
  conversationsByJob,
  selectedJobId,
  onSelectJob,
}) => {
  if (conversationsByJob.size === 0) {
    return (
      <div className="p-8 text-center text-gray-500 mt-10">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-bold text-gray-900">No Messages</p>
        <p className="text-sm mt-1">New messages will appear here.</p>
      </div>
    );
  }

  // Animation for the list container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  // Animation for each list item
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="p-3 space-y-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {Array.from(conversationsByJob.entries()).map(
        ([jobId, { jobDetails, convos }]) => (
          <motion.div
            key={jobId}
            variants={itemVariants}
            onClick={() => {
              if (selectedJobId === jobId) {
                onSelectJob(null);
              } else {
                onSelectJob(jobId);
              }
            }}
            className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${selectedJobId === jobId
              ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30 transform scale-[1.02]"
              : "bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:shadow-md hover:-translate-y-0.5"
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3
                className={`font-bold text-sm leading-tight line-clamp-2 ${selectedJobId === jobId ? "text-white" : "text-gray-900"
                  }`}
              >
                {jobDetails.title}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${selectedJobId === jobId
                  ? "bg-white/20 text-white"
                  : "bg-blue-50 text-blue-600"
                  }`}
              >
                {convos.length}
              </span>
            </div>
            <div className="flex items-center gap-1.5 opacity-90">
              <Briefcase className={`w-3 h-3 ${selectedJobId === jobId ? "text-blue-200" : "text-gray-400"}`} />
              <p
                className={`text-xs font-medium ${selectedJobId === jobId ? "text-blue-100" : "text-gray-500"
                  }`}
              >
                {convos.length} applicant{convos.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>
        )
      )}
    </motion.div>
  );
};

// --- Panel 2: List of Applicants for the selected job ---
export const ApplicantListPanel = ({
  conversations,
  selectedConvoId,
  onSelectConvo,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 mt-10">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8 text-gray-400" />
        </div>
        <p className="font-bold text-gray-900">No Applicants</p>
        <p className="text-sm mt-1">Applicants for this job will appear here.</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="divide-y divide-gray-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {conversations.map((convo) => {
        const isSelected = selectedConvoId === convo._id;
        const lastMessage = convo.lastMessage;
        const isUnread =
          lastMessage && lastMessage.sender === convo.recipient._id;

        return (
          <motion.div
            key={convo._id}
            variants={itemVariants}
            onClick={() => onSelectConvo(convo)}
            className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${isSelected ? "bg-blue-50/50 border-l-4 border-blue-600" : "border-l-4 border-transparent"
              }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {convo.recipient.avatar ? (
                  <img
                    src={convo.recipient.avatar}
                    alt={convo.recipient.fullName}
                    className={`w-12 h-12 rounded-xl object-cover shadow-sm ${isSelected
                      ? "ring-2 ring-blue-500 ring-offset-2"
                      : "ring-1 ring-gray-100"
                      }`}
                  />
                ) : (
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${isSelected
                      ? "bg-blue-100 text-blue-600 ring-2 ring-blue-500 ring-offset-2"
                      : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500"
                      }`}
                  >
                    <User className="w-6 h-6" />
                  </div>
                )}
                {isUnread && (
                  <span className="absolute -top-1 -right-1 block h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm animate-pulse" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3
                    className={`text-sm font-bold truncate ${isUnread ? "text-gray-900" : "text-gray-700"
                      }`}
                  >
                    {convo.recipient.fullName}
                  </h3>
                  <span
                    className={`text-[10px] flex-shrink-0 ml-2 font-medium ${isUnread ? "text-blue-600" : "text-gray-400"
                      }`}
                  >
                    {moment(convo.updatedAt).format("h:mm A")}
                  </span>
                </div>
                <p
                  className={`text-xs truncate leading-relaxed ${isUnread ? "text-gray-900 font-semibold" : "text-gray-500"
                    }`}
                >
                  {lastMessage?.text || "No messages yet"}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
