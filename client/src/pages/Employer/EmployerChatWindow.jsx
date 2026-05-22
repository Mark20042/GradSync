import React, { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH, BASE_URL } from "../../utils/apiPath";
import { fixLegacyUrls } from "../../utils/axiosInstance";
import io from "socket.io-client";
import { Send, User, MessageCircleDashed } from "lucide-react";
import moment from "moment";
import { motion, AnimatePresence } from "framer-motion";

const getCalendarDate = (date) => {
  return moment(date).calendar(null, {
    sameDay: "[Today]",
    lastDay: "[Yesterday]",
    lastWeek: "MMMM D, YYYY",
    sameElse: "MMMM D, YYYY",
  });
};

const TypingIndicator = () => {
  const dotVariants = {
    hidden: { y: 0, opacity: 0.5 },
    visible: { y: -10, opacity: 1 },
  };
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.15 } },
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 pt-20">
      <motion.div className="flex gap-2" variants={containerVariants} initial="hidden" animate="visible">
        {[1, 2, 3].map((i) => (
          <motion.span
            key={i}
            className="w-3 h-3 bg-gray-400 rounded-full"
            variants={dotVariants}
            transition={{ duration: 0.4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        ))}
      </motion.div>
      <p className="text-sm font-medium text-gray-500 mt-4">Loading messages...</p>
    </div>
  );
};

const EmployerChatWindow = ({ conversation }) => {
  const { user } = useAuth();
  const { _id: conversationId, recipient: graduate } = conversation;

  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (conversationId) {
      const fetchMessages = async () => {
        setLoading(true);
        try {
          const response = await axiosInstance.get(API_PATH.CHAT.GET_MESSAGES(conversationId));
          setMessages(response.data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchMessages();
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
    if (!socket || newMessage.trim() === "" || !graduate) return;

    const messageData = {
      conversationId: conversationId,
      senderId: user._id,
      recipientId: graduate._id,
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
        messagesWithDates.push({ type: "date", id: "date-" + msg._id, date: getCalendarDate(currentDate) });
        lastDate = currentDate;
      }
      messagesWithDates.push({ type: "message", ...msg });
    });
    return messagesWithDates;
  }, [messages]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden relative">
      {/* Chat Header */}
      <div className="flex-none p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            {graduate.avatar ? (
              <img src={graduate.avatar} alt={graduate.fullName} className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-base leading-tight">{graduate.fullName}</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Applicant for: <span className="text-blue-600">{conversation.job?.title || 'Unknown Job'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
        <AnimatePresence initial={false}>
          {loading ? (
            <div className="flex justify-center pt-20"><TypingIndicator /></div>
          ) : processedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
              <MessageCircleDashed className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400">Start the conversation below</p>
            </div>
          ) : (
            processedMessages.map((item) => {
              if (item.type === "date") {
                return (
                  <div key={item.id} className="flex justify-center py-2">
                    <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {item.date}
                    </span>
                  </div>
                );
              }

              const isMe = item.sender._id === user._id;

              return (
                <motion.div key={item._id} variants={messageVariants} initial="hidden" animate="visible" layout className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-end gap-3 max-w-[85%] ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <div className="flex-shrink-0">
                      <img src={item.sender.avatar || `https://placehold.co/150/${isMe ? '4338ca' : 'b0b0b0'}/ffffff?text=${isMe ? 'E' : 'U'}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm" />
                    </div>

                    <div className={`relative p-4 rounded-2xl shadow-sm ${isMe ? "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-sm" : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"}`}>
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{item.content}</p>
                      <p className={`text-[10px] mt-1.5 text-right ${isMe ? "text-blue-100" : "text-gray-400"}`}>
                        {moment(item.createdAt).format("h:mm A")}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <div className="flex-none p-4 bg-white border-t border-gray-100">
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
  );
};

export default EmployerChatWindow;
