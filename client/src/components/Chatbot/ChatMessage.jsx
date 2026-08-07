import React from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";


const RichText = ({ text }) => {
  const lines = String(text).split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        const bullet = /^[-•*]\s+/.test(trimmed);
        const numbered = /^\d+[.)]\s+/.test(trimmed);
        const body = bullet ? trimmed.replace(/^[-•*]\s+/, "") : trimmed;

        return (
          <p
            key={i}
            className={`${bullet || numbered ? "pl-3.5 relative" : ""} ${
              i > 0 ? "mt-1.5" : ""
            } leading-relaxed break-words`}
          >
            {bullet && (
              <span className="absolute left-0 top-0 text-indigo-500 font-bold">
                •
              </span>
            )}
            <Inline text={body} />
          </p>
        );
      })}
    </>
  );
};


const Inline = ({ text }) => {
  const parts = String(text).split(/(https?:\/\/[^\s)]+|\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^https?:\/\//.test(part)) {
      const clean = part.replace(/[.,;:]$/, "");
      const trailing = part.slice(clean.length);
      return (
        <React.Fragment key={i}>
          <a
            href={clean}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 font-medium underline decoration-indigo-300 decoration-1 underline-offset-2 hover:decoration-indigo-600 break-all"
          >
            {clean}
          </a>
          {trailing}
        </React.Fragment>
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";


  if (message.id === "greeting") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center pt-6 pb-2"
      >
        <div className="w-28 h-28 mb-4 relative">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-2xl opacity-40 -z-10" />
          <img src="/qubiwaving.svg?v=3" alt="Bibo" className="relative w-full h-full object-contain drop-shadow-sm" />
        </div>
        <div className=" text-gray-700 px-5 py-4 text-center max-w-[95%] sm:max-w-[85%] text-[13.5px] sm:text-sm leading-relaxed">
          <RichText text={message.content} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[13.5px] sm:text-sm shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md"
            : message.isError
              ? "bg-red-50 text-red-800 border border-red-200 rounded-bl-md"
              : "bg-white text-gray-700 border border-gray-200/80 rounded-bl-md"
        }`}
      >
        {message.isError ? (
          <div className="flex gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{message.content}</span>
          </div>
        ) : isUser ? (
          <p className="leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        ) : (
          <RichText text={message.content} />
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
