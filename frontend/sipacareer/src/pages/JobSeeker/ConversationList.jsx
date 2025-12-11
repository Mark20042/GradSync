import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import Navbar from "./components/Navbar";
import { MessageCircleDashed, Building2, ArrowLeft, User, MessageSquare, Briefcase, Users } from "lucide-react";
import moment from "moment";
import LoadingSpinner from "../../components/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

const ConversationList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);


  const [searchParams] = useSearchParams();
  const userIdToMessage = searchParams.get("userId");

  useEffect(() => {
    if (user) {
      const fetchConversations = async () => {
        try {
          setLoading(true);
          const response = await axiosInstance.get(API_PATH.CHAT.GET_CONVERSATIONS);
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

  useEffect(() => {
    const initiateChat = async () => {
      if (userIdToMessage && user) {
        try {
          // Check if we already have this conversation loaded
          const existingConvo = conversations.find(
            (c) => c.recipient && c.recipient._id === userIdToMessage
          );

          if (existingConvo) {
            openChat(existingConvo);
          } else {
            // If not found in list, try to create/fetch it from server
            const response = await axiosInstance.post(API_PATH.CHAT.FIND_OR_CREATE_CONVERSATION, {
              recipientId: userIdToMessage,
            });
            const newConvo = response.data;

            // Need to format it properly before opening
            const recipient = newConvo.participants.find(p => p._id !== user._id);
            openChat({
              _id: newConvo._id,
              recipient: recipient,
              job: newConvo.job,
              lastMessage: newConvo.lastMessage,
              updatedAt: newConvo.updatedAt
            });
          }
        } catch (error) {
          console.error("Error initiating chat:", error);
        }
      }
    };

    if (!loading && conversations.length >= 0) {
      initiateChat();
    }
  }, [userIdToMessage, user, loading, conversations]);

  const openChat = (convo) => {
    navigate(`/messages/${convo._id}`, {
      state: {
        recipient: convo.recipient,
        job: convo.job || null,
      },
    });
  };

  // Filter to only show company conversations
  const filteredConversations = conversations.filter(convo => convo.recipient?.role === 'employer');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="pt-20 flex justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 pb-12 max-w-4xl">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Messages</h1>
            <p className="text-gray-500 mt-1">Manage your communications with companies</p>
          </div>
          <button
            onClick={() => navigate("/find-jobs")}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
            <span className="font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Back to Jobs</span>
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden min-h-[500px]">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-8">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <MessageCircleDashed className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                You haven't messaged any companies yet. Apply to jobs to start a conversation.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map((convo) => (
                <motion.div
                  key={convo._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => openChat(convo)}
                  className="group p-5 hover:bg-blue-50/30 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {convo.recipient?.avatar || convo.recipient?.companyLogo ? (
                        <img
                          src={convo.recipient.avatar || convo.recipient.companyLogo}
                          alt={convo.recipient.fullName || convo.recipient.companyName}
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20">
                          <Building2 className="w-7 h-7 text-white" />
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors truncate pr-4">
                          {convo.recipient?.companyName || convo.recipient?.fullName || 'Unknown'}
                        </h3>
                        <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                          {moment(convo.updatedAt).fromNow(true)}
                        </span>
                      </div>

                      {/* Job title if applicable */}
                      {convo.job && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                          <Briefcase className="w-3 h-3" />
                          <span className="truncate">{convo.job.title}</span>
                        </div>
                      )}

                      {/* Last message */}
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {convo.lastMessage?.text || <span className="italic text-gray-400">No messages yet...</span>}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationList;
