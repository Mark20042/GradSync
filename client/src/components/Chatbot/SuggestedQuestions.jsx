import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Opening prompts, chosen per role so nobody is offered a feature they cannot
 * use. Keep these phrased the way a real person would ask.
 */
const BY_ROLE = {
  graduate: [
    "How do I get the verified badge?",
    "What are GradCoins for?",
    "Do employers see my assessment results?",
    "How do I take a mock interview?",
  ],
  employer: [
    "How do I post a job?",
    "How do I set up automated FAQs?",
    "How do I set my business hours?",
    "Where do I review who applied?",
  ],
  guest: [
    "What is GradSync?",
    "How do I create an account?",
    "What are Industry Trends?",
    "Do I need to pay to use GradSync?",
  ],
  admin: [
    "Where do I manage users?",
    "How is AI usage monitored?",
    "Where are assessments reviewed?",
    "What are GradCoins for?",
  ],
};

const SuggestedQuestions = ({ role, onPick, disabled }) => {
  const questions = BY_ROLE[role] ?? BY_ROLE.guest;

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center gap-1.5 mb-2.5 text-gray-400">
        <Sparkles size={12} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          Try asking
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {questions.map((question, i) => (
          <motion.button
            key={question}
            type="button"
            disabled={disabled}
            onClick={() => onPick(question)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i, duration: 0.2 }}
            className="text-[12px] leading-snug text-left px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {question}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SuggestedQuestions;
