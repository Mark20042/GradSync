import React, { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

const MAX_LENGTH = 1000;

const ChatInput = ({ onSend, onStop, isSending, autoFocus }) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, 120);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > 120 ? "auto" : "hidden";
  }, [value]);

  useEffect(() => {
    if (autoFocus && window.innerWidth >= 640) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const submit = () => {
    const text = value.trim();
    if (!text || isSending) return;
    onSend(text);
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const remaining = MAX_LENGTH - value.length;
  const canSend = value.trim().length > 0 && !isSending;

  return (
    <div className="border-t border-gray-200/80 bg-white/95 backdrop-blur px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={value}
            maxLength={MAX_LENGTH}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about GradSync…"
            aria-label="Message GradSync Support"
            className="w-full resize-none overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/80 px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-colors leading-relaxed"
            style={{ fontSize: "16px" }}
          />
          {remaining < 100 && (
            <span
              className={`absolute -top-5 right-1 text-[10px] font-medium ${
                remaining < 20 ? "text-red-500" : "text-gray-400"
              }`}
            >
              {remaining}
            </span>
          )}
        </div>

        {isSending ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="shrink-0 w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-900 transition-colors shadow-md"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            aria-label="Send message"
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
              canSend
                ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:-translate-y-0.5"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        )}
      </div>

      <p className="mt-2 text-center text-[10.5px] text-gray-400">
        GradSync Support can make mistakes. Verify important details.
      </p>
    </div>
  );
};

export default ChatInput;
