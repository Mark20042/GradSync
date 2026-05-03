import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const Contact = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is GradSync and how does it work?",
      answer:
        "GradSync is a comprehensive platform that connects fresh graduates with employers. We use AI-powered tools to help you build professional resumes, practice mock interviews, take skill assessments, and discover job opportunities that match your qualifications. Simply create an account, complete your profile, and start exploring opportunities.",
    },
    {
      question: "Is GradSync free to use for graduates?",
      answer:
        "Yes! GradSync is completely free for graduates and job seekers. You can create your profile, build your resume, take assessments, practice interviews, and apply to jobs without any cost. Employers pay a subscription fee to post jobs and access our talent pool.",
    },
    {
      question: "How does the AI interview practice work?",
      answer:
        "Our AI-powered mock interview feature simulates real interview scenarios based on the job role you’re applying for. You’ll answer questions via text or voice, and our AI evaluates your responses, providing detailed feedback on your performance, communication skills, and areas for improvement. You’ll receive a comprehensive score and actionable insights to help you prepare better.",
    },
    {
      question: "What documents do I need to verify my account?",
      answer:
        "For graduates, you’ll need to upload your Transcript of Records (TOR) or diploma. For employers, you’ll need to provide your Business Permit or company registration documents. Our automated system verifies these documents to ensure the authenticity of all users on the platform.",
    },
    {
      question: "How do employers find my profile?",
      answer:
        "Employers can search for candidates based on skills, education, location, and experience. When you complete your profile and take skill assessments, your profile becomes more visible to employers. You can also apply directly to job postings, and employers will be notified of your application.",
    },
    {
      question: "Can I edit my resume after creating it?",
      answer:
        "Absolutely! You can edit your resume, profile information, and portfolio at any time. We recommend keeping your profile updated with new skills, certifications, and experiences to increase your chances of being discovered by employers.",
    },
    {
      question: "How long does account verification take?",
      answer:
        "Account verification is typically instant for most users. Our AI-powered system automatically verifies your documents within seconds. In rare cases where manual review is needed, verification may take up to 24-48 hours. You’ll receive an email notification once your account is verified.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center px-4 sm:px-6 py-16 sm:py-24">
      <div className="max-w-4xl mx-auto w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked <span className="text-purple-600">Questions</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about GradSync and how we can help
            you in your career journey.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: false, amount: 0.3 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none group"
              >
                <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4 group-hover:text-purple-600 transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown
                    className={`w-6 h-6 transition-colors ${
                      openIndex === index
                        ? "text-purple-600"
                        : "text-gray-400 group-hover:text-purple-600"
                    }`}
                  />
                </motion.div>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pt-2">
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: false, amount: 0.3 }}
          className="mt-12 text-center bg-white rounded-2xl shadow-lg p-8"
        >
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            We’re here to help! Reach out to our support team.
          </p>
          <a
            href="mailto:support@gradsync.tech"
            className="inline-block px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl shadow-lg hover:bg-purple-700 transition-colors"
          >
            Contact Support
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
