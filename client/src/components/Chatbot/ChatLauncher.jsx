import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

const ChatLauncher = ({ isOpen, onClick, showHint, onDismissHint }) => (
  <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[60] flex flex-col items-end gap-3">
    <AnimatePresence>
      {showHint && !isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="relative hidden sm:flex items-center gap-2 bg-white rounded-2xl shadow-[0_8px_25px_rgb(0,0,0,0.08)] border border-gray-100 pl-4 pr-2 py-2.5 max-w-[230px]"
        >
          <div className="absolute -bottom-1.5 right-8 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45" />
          <p className="text-[12.5px] text-gray-600 leading-snug">
            Need help finding something?
          </p>
        </motion.div>
      )}
    </AnimatePresence>

    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isOpen ? "Close GradSync Support" : "Open GradSync Support"}
      aria-expanded={isOpen}
      className={`relative h-[60px] rounded-full flex items-center justify-center overflow-hidden transition-all ${
        isOpen
          ? "w-[60px] bg-sky-500 text-white shadow-xl"
          : "px-2 pr-5 bg-sky-400 shadow-[0_8px_25px_rgba(56,189,248,0.35)] hover:shadow-[0_12px_30px_rgba(56,189,248,0.45)] hover:-translate-y-1"
      }`}
    >
      {isOpen && <span className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/15 pointer-events-none" />}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isOpen ? "close" : "open"}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          className="flex items-center justify-center gap-3 h-full"
        >
          {isOpen ? (
           <div className="relative w-[44px] h-[44px] flex-shrink-0  rounded-full flex items-center justify-center ">
                <img
                  src="/qubi.svg?v=4"
                  alt="Qubi"
                  className="w-[85%] h-[85%] object-contain"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-10" />
              </div>
          ) : (
            <>
              <div className="relative w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center ">
                <img
                  src="/qubi.svg?v=4"
                  alt="Qubi"
                  className="w-[85%] h-[85%] object-contain"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full z-10" />
              </div>
              <span className="font-semibold text-[15px] text-white whitespace-nowrap drop-shadow-sm">
                Ask Bibo
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {!isOpen && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent pointer-events-none"
          animate={{ scale: [1, 1.05], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
    </motion.button>
  </div>
);

export default ChatLauncher;
