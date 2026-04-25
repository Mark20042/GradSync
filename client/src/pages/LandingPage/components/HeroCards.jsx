import React from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Clock,
    Building2,
    DollarSign,
    Briefcase,
    Users,
    Send,
} from "lucide-react";

const HeroCards = () => {
    return (
        <div className="flex-1 w-full max-w-lg lg:max-w-xl relative">
            <div className="relative h-[500px] md:h-[520px]">

                {/* Resume Card - Professional Document Style */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 8 }}
                    whileInView={{ opacity: 1, x: 0, rotate: 4 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="absolute top-0 right-0 w-[280px] md:w-[300px] bg-white rounded-2xl shadow-xl border border-gray-100 z-10 overflow-hidden"
                >
                    {/* Resume Document */}
                    <div className="p-5">
                        {/* Name Header */}
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">DON JUAN</h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                            <span>📧 don.juan@email.com</span>
                            <span>📱 09123456789</span>
                        </div>

                        {/* Professional Summary */}
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">
                                Professional Summary
                            </h4>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                A highly skilled web programmer with expertise in JavaScript, GatsbyJS, Astro, Expo, NextJS, NodeJS, ...
                            </p>
                        </div>

                        {/* Education */}
                        <div className="mt-3">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">
                                Education
                            </h4>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs font-semibold text-gray-800">Cebu Roosevelt Memorial Colleges</p>
                                    <p className="text-xs text-gray-500">BS Information Technology</p>
                                </div>
                                <span className="text-xs text-orange-500 font-medium">2027</span>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-3">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">
                                Skills
                            </h4>
                            <div className="flex flex-wrap gap-1">
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">JavaScript</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">GatsbyJS</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">Astro</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">Expo</span>
                                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded">RiddleJs</span>
                            </div>
                        </div>

                        {/* Awards */}
                        <div className="mt-3">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">
                                Awards
                            </h4>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-600">Dean's List</p>
                                <span className="text-xs text-orange-500 font-medium">2024</span>
                            </div>
                        </div>
                    </div>


                </motion.div>

                {/* Job Card - Front */}
                <motion.div
                    initial={{ opacity: 0, x: -30, rotate: -6 }}
                    whileInView={{ opacity: 1, x: 0, rotate: -3 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="absolute top-16 left-0 w-[300px] md:w-[340px] bg-white rounded-3xl p-6 shadow-2xl shadow-gray-900/10 border border-gray-100 z-20"
                >
                    {/* Card Header */}
                    <div className="flex items-start gap-4 mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <Briefcase className="text-white w-7 h-7" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg">Vulcanizer</h3>
                            <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                                <Building2 className="w-4 h-4" />
                                GradSync
                            </p>
                        </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 gap-2.5 mb-5">
                        <div className="bg-gray-50 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-0.5">
                                <MapPin className="w-3 h-3" />
                                <span>Location</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">Makati City</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-0.5">
                                <Clock className="w-3 h-3" />
                                <span>Type</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">Full-time</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-0.5">
                                <DollarSign className="w-3 h-3" />
                                <span>Salary</span>
                            </div>
                            <p className="font-semibold text-purple-600 text-sm">₱45K - ₱60K</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-2.5">
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-0.5">
                                <Users className="w-3 h-3" />
                                <span>Applicants</span>
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">24 applied</p>
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5 mb-5">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">MongoDB</span>
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">ExpressJS</span>
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">ReactJS</span>
                        <span className="px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-lg">NodeJS</span>

                    </div>

                    {/* Action Button */}
                    <button className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl text-sm shadow-lg shadow-blue-600/30">
                        Apply Now
                    </button>
                </motion.div>

                {/* Floating elements */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="absolute bottom-8 right-8 bg-white rounded-2xl px-4 py-3 shadow-lg border border-gray-100 z-30"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8  rounded-full flex items-center justify-center">
                            <Send className="text-green-600 text-lg" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Application Sent!</p>
                            <p className="text-sm font-semibold text-gray-900">Good luck! 🎉</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default HeroCards;
