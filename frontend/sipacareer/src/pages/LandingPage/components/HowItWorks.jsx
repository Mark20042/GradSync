import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, FileSearch, Send, Handshake } from 'lucide-react';

const steps = [
    {
        icon: <UserPlus className="text-white" size={24} />,
        title: "Create Profile",
        desc: "Sign up and build your professional profile with your skills and experience."
    },
    {
        icon: <FileSearch className="text-white" size={24} />,
        title: "Get Matched",
        desc: "Our system finds jobs that match your qualifications and preferences."
    },
    {
        icon: <Send className="text-white" size={24} />,
        title: "Apply Smart",
        desc: "Apply to jobs with one click and track your application status."
    },
    {
        icon: <Handshake className="text-white" size={24} />,
        title: "Get Hired",
        desc: "Connect with employers and land your dream job."
    }
];

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 }
};

const HowItWorks = () => {
    return (
        <section id="how-it-works" className="py-20 bg-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-purple-100/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-1/2 right-0 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Path to Employment</h2>
                    <p className="text-gray-500 max-w-xl mx-auto">Four simple steps to land your dream job and kickstart your career.</p>
                </motion.div>

                {/* Steps Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.15 }}
                            className="relative"
                        >
                            {/* Connector line (hidden on mobile, last item) */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 translate-x-8"></div>
                            )}

                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-300 relative z-10">
                                {/* Step number */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </div>

                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-4 shadow-lg">
                                    {step.icon}
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
