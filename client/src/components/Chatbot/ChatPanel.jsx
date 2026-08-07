import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw, X, Minus } from "lucide-react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import SuggestedQuestions from "./SuggestedQuestions";

const ROLE_LABEL = {
  graduate: "Graduate",
  employer: "Employer",
  admin: "Administrator",
  guest: "Visitor",
};

const ChatPanel = ({ onClose, chat, role }) => {
  const { messages, isSending, send, stop, reset } = chat;
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isSending]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const showSuggestions = messages.length <= 1 && !isSending;

  return (
    <motion.div
      role="dialog"
      aria-label="GradSync Support"
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="
        fixed z-[70] flex flex-col overflow-hidden bg-[#f7fafe]
        bottom-20 right-4 w-[calc(100vw-2rem)] h-[min(600px,calc(100vh-7rem))]
        sm:bottom-24 sm:right-6 sm:w-[400px] sm:h-[min(620px,calc(100vh-8rem))]
        rounded-2xl sm:rounded-3xl shadow-2xl shadow-gray-900/20 border border-gray-200/70
      "
    >
      <div className="relative shrink-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white px-4 pt-[max(0.875rem,env(safe-area-inset-top))] pb-3.5 overflow-hidden">
        <div className="absolute -top-10 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10   flex items-center justify-center shrink-0  overflow-hidden">
            <img src="/qubiwaving.svg?v=3" alt="Bibo Waving" className="w-[120%] h-[120%] object-cover mt-1" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-[15px] leading-tight truncate">
              Bibo - Chatbot
            </h2>
            <p className="text-[11.5px] text-white/75 flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400" />
              {isSending ? "Thinking…" : `Online · ${ROLE_LABEL[role] ?? "Visitor"}`}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={reset}
              aria-label="Start a new conversation"
              title="New conversation"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3"
      >
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isSending && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {showSuggestions && (
        <SuggestedQuestions role={role} onPick={send} disabled={isSending} />
      )}

      <ChatInput
        onSend={send}
        onStop={stop}
        isSending={isSending}
        autoFocus
      />
    </motion.div>
  );
};

export default ChatPanel;
