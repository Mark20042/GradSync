import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "./../../utils/axiosInstance";
import { API_PATH, BASE_URL } from "./../../utils/apiPath";
import { fixLegacyUrls } from "./../../utils/axiosInstance";
import io from "socket.io-client";
import Navbar from "./components/Navbar";
import { Send, ArrowLeft, MessageCircleDashed, Building2, Briefcase } from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";
import MessageListSkeleton from "./components/skeletons/MessageListSkeleton";

const getCalendarDate = (date) => {
  return moment(date).calendar(null, {
    sameDay: "[Today]",
    lastDay: "[Yesterday]",
    lastWeek: "MMMM D, YYYY",
    sameElse: "MMMM D, YYYY",
  });
};

const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 p-4 bg-white rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 w-fit">
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
    </div>
  );
};

const Messages = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [localRecipient, setLocalRecipient] = useState(state?.recipient || null);
  const [localJob, setLocalJob] = useState(state?.job || null);

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [faqs, setFaqs] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversationId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const msgResponse = await axiosInstance.get(API_PATH.CHAT.GET_MESSAGES(conversationId));
          setMessages(msgResponse.data);

          let currentRecipient = localRecipient;
          let currentJob = localJob;

          // If accessed via direct link/notification, fetch details manually
          if (!currentRecipient) {
            try {
              const convoRes = await axiosInstance.get(API_PATH.CHAT.GET_CONVERSATIONS);
              const convo = convoRes.data.find(c => c._id === conversationId);
              if (convo && convo.recipient) {
                currentRecipient = convo.recipient;
                currentJob = convo.job;
                setLocalRecipient(convo.recipient);
                setLocalJob(convo.job);
              }
            } catch (err) {
              console.error("Failed to load conversation details", err);
            }
          }

          if (currentRecipient && currentRecipient.role === "employer") {
            const faqResponse = await axiosInstance.get(API_PATH.EMPLOYER.GET_PUBLIC_FAQS(currentRecipient._id));
            setFaqs(faqResponse.data);
          } else if (currentRecipient && currentRecipient._id) {
            try {
              const faqResponse = await axiosInstance.get(API_PATH.EMPLOYER.GET_PUBLIC_FAQS(currentRecipient._id));
              setFaqs(faqResponse.data);
            } catch (err) {
              // Ignore
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [conversationId]);

  useEffect(() => {
    if (!user) return;
    const newSocket = io(BASE_URL);
    setSocket(newSocket);
    newSocket.emit("joinRoom", user._id);
    newSocket.on("receiveMessage", (message) => {
      const fixedMessage = fixLegacyUrls(message);
      if (fixedMessage.conversationId === conversationId) {
        setMessages((prevMessages) => [...prevMessages, fixedMessage]);
      }
    });
    return () => newSocket.disconnect();
  }, [user, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!socket || newMessage.trim() === "" || !localRecipient) return;

    const messageData = {
      conversationId: conversationId,
      senderId: user._id,
      recipientId: localRecipient._id,
      content: newMessage.trim(),
    };
    socket.emit("sendMessage", messageData);

    const tempMessage = {
      ...messageData,
      _id: Date.now(),
      sender: {
        _id: user._id,
        fullName: user.fullName,
        avatar: user.avatar,
      },
      createdAt: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, tempMessage]);
    setNewMessage("");
  };

  const processedMessages = useMemo(() => {
    let lastDate = null;
    const messagesWithDates = [];

    messages.forEach((msg) => {
      const currentDate = moment(msg.createdAt);
      if (!lastDate || !currentDate.isSame(lastDate, "day")) {
        messagesWithDates.push({
          type: "date",
          id: "date-" + msg._id,
          date: getCalendarDate(currentDate),
        });
        lastDate = currentDate;
      }
      messagesWithDates.push({ type: "message", ...msg });
    });
    return messagesWithDates;
  }, [messages]);

  if (!localRecipient && !loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <MessageCircleDashed className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Conversation Not Found</h2>
          <p className="text-gray-500 mt-2">This conversation could not be loaded or has been deleted.</p>
          <button
            onClick={() => navigate("/messages")}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-gray-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F8FAFC] flex flex-col overflow-hidden">
      <Navbar />

      {/* Main Chat Container */}
      <div className="flex-1 flex flex-col pt-20 px-4 pb-6 max-w-5xl mx-auto w-full min-h-0">
        <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">

          {/* Header */}
          <div className="flex-none p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/messages")}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div
                onClick={() => {
                  if (localRecipient?.role === 'employer') {
                    navigate(`/company/${localRecipient._id}`);
                  } else {
                    navigate(`/user/${localRecipient._id}`);
                  }
                }}
                className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors group"
              >
                <div className="relative">
                  {localRecipient?.avatar || localRecipient?.companyLogo ? (
                    <img
                      src={localRecipient.avatar || localRecipient.companyLogo}
                      alt={localRecipient.fullName || localRecipient.companyName}
                      className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                    {localRecipient?.companyName || localRecipient?.fullName || "User"}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mt-0.5">
                    <Briefcase className="w-3 h-3" />
                    <span className="truncate max-w-[200px]">{localJob?.title || "General Inquiry"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
            {loading ? (
              <MessageListSkeleton />
            ) : processedMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                <MessageCircleDashed className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium">No messages yet</p>
                <p className="text-sm text-gray-400">Start the conversation below</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {processedMessages.map((item) => (
                  item.type === "date" ? (
                    <div key={item.id} className="flex justify-center py-2">
                      <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {item.date}
                      </span>
                    </div>
                  ) : (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${item.sender._id === user._id ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end gap-3 max-w-[85%] ${item.sender._id === user._id ? "flex-row-reverse" : "flex-row"}`}>
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {item.sender._id === user._id ? (
                            <img
                              src={user.avatar || "https://placehold.co/150/b0b0b0/ffffff?text=ME"}
                              alt="Me"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          ) : (
                            <img
                              src={item.sender.avatar || "https://placehold.co/150/4338ca/ffffff?text=E"}
                              alt="Employer"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                            />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`relative p-4 rounded-2xl shadow-sm ${item.sender._id === user._id
                          ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-sm"
                          : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                          }`}>
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{item.content}</p>
                          <p className={`text-[10px] mt-1.5 text-right ${item.sender._id === user._id ? "text-blue-100" : "text-gray-400"
                            }`}>
                            {moment(item.createdAt).format("h:mm A")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-none p-4 bg-white border-t border-gray-100">
            {/* FAQs */}
            {faqs.length > 0 && (
              <div className="mb-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar mask-linear-fade">
                {faqs.filter(faq => {
                  // Show if it's a general FAQ (no job linked)
                  if (!faq.job) return true;
                  // Show if it matches the current job context
                  if (localJob && faq.job._id === localJob._id) return true;
                  return false;
                }).map((faq) => (
                  <button
                    key={faq._id}
                    onClick={() => setNewMessage(faq.question)}
                    className="flex-shrink-0 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold px-4 py-2 rounded-xl border border-blue-100 transition-all duration-200 whitespace-nowrap shadow-sm"
                  >
                    {faq.question}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={newMessage.trim() === ""}
                className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
