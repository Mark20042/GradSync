import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, Briefcase, X, Paperclip, ArrowLeft } from "lucide-react";
import Navbar from "./components/Navbar";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATH } from "../../utils/apiPath";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const AIMentorChat = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "ai",
            content: `Hello ${user?.fullName || "there"}! I'm your AI Career Mentor. I can help you analyze job descriptions, improve your profile, or give general career advice. How can I assist you today?`
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [availableJobs, setAvailableJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchJobs = async () => {
        try {
            const res = await axiosInstance.get(API_PATH.JOBS.GET_ALL_JOBS);
            setAvailableJobs(res.data || []);
            setShowJobModal(true);
        } catch (error) {
            console.error("Error fetching jobs:", error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = {
            id: Date.now(),
            sender: "user",
            content: input,
            jobContext: selectedJob
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await axiosInstance.post(API_PATH.AI.MENTOR, {
                question: userMsg.content,
                referenceJobId: selectedJob?._id
            });

            const aiMsg = {
                id: Date.now() + 1,
                sender: "ai",
                content: res.data.answer
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                sender: "ai",
                content: "I'm sorry, I encountered an error while processing your request. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
            <Navbar />

            {/* Main Chat Container */}
            <div className="flex-1 pt-20 px-4 pb-6 max-w-5xl mx-auto w-full flex flex-col h-screen">
                <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">

                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 text-lg">AI Career Mentor</h2>
                                <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                    Online
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate("/find-jobs")}
                            className="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Jobs
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                        <AnimatePresence initial={false}>
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex items-end gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        {/* Avatar */}
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === "user"
                                            ? "bg-gray-200"
                                            : "bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20"
                                            }`}>
                                            {msg.sender === "user" ? (
                                                <span className="text-xs font-bold text-gray-600">ME</span>
                                            ) : (
                                                <Bot className="w-4 h-4 text-white" />
                                            )}
                                        </div>

                                        {/* Message Bubble */}
                                        <div className={`relative p-5 rounded-2xl shadow-sm ${msg.sender === "user"
                                            ? "bg-blue-600 text-white rounded-br-sm"
                                            : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
                                            }`}>
                                            {msg.jobContext && (
                                                <div className="mb-3 pb-3 border-b border-white/20 flex items-center gap-2 text-xs font-medium opacity-90">
                                                    <Briefcase className="w-3.5 h-3.5" />
                                                    <span>Context: {msg.jobContext.title}</span>
                                                </div>
                                            )}
                                            <p className="text-[15px] leading-7 whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="flex items-end gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white px-5 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-gray-100 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Context Bar */}
                    <AnimatePresence>
                        {selectedJob && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-blue-50/80 backdrop-blur-sm border-t border-blue-100 px-6 py-3 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-3 text-sm text-blue-800">
                                    <div className="bg-blue-100 p-1.5 rounded-lg">
                                        <Briefcase className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <span className="font-semibold mr-1">Analyzing Job:</span>
                                        {selectedJob.title}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-gray-100">
                        <form onSubmit={handleSendMessage} className="relative flex items-end gap-3 max-w-4xl mx-auto">
                            <button
                                type="button"
                                onClick={fetchJobs}
                                className={`px-4 py-3.5 rounded-xl transition-all duration-200 flex-shrink-0 flex items-center gap-2 ${selectedJob
                                    ? "bg-blue-50 text-blue-600 ring-2 ring-blue-100"
                                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    }`}
                                title="Attach Job Context"
                            >
                                <Paperclip className="w-5 h-5" />
                                <span className="text-sm font-medium">Attach Job</span>
                            </button>

                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask for career advice..."
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!input.trim() || loading}
                                className="p-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none transition-all duration-200"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                        <div className="text-center mt-3">
                            <p className="text-xs text-gray-400">
                                AI can make mistakes. Consider checking important information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Selection Modal */}
            <AnimatePresence>
                {showJobModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-gray-900">Select a Job Context</h3>
                                <button
                                    onClick={() => setShowJobModal(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>
                            <div className="overflow-y-auto p-3 space-y-2">
                                {availableJobs.map(job => (
                                    <button
                                        key={job._id}
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setShowJobModal(false);
                                        }}
                                        className="w-full text-left p-4 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 group"
                                    >
                                        <div className="font-semibold text-gray-900 group-hover:text-blue-700">{job.title}</div>
                                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                                            <Briefcase className="w-3 h-3" />
                                            {job.company?.companyName}
                                        </div>
                                    </button>
                                ))}
                                {availableJobs.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        No jobs found to analyze.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AIMentorChat;
