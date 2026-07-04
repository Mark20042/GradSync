import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';
import { Briefcase, Activity, BarChart2, Hexagon, TrendingUp, Star } from 'lucide-react';
import { CATEGORIES } from '../utils/data';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

const InDemandSkillsGraph = ({ compact = false }) => {
  const categories = CATEGORIES;
  const [skillsData, setSkillsData] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]?.label || null);



  useEffect(() => {
    if (selectedCategory) {
      fetchSkills(selectedCategory);
    }
  }, [selectedCategory]);



  const fetchSkills = async (category) => {
    setLoadingSkills(true);
    try {
      const res = await axiosInstance.get(`/api/analytics/public/in-demand-skills?category=${encodeURIComponent(category)}`);
      setSkillsData((res.data.data || []).slice(0, 5));
      setTopJobs(res.data.topJobs || []);
    } catch (err) {
      console.error("Failed to fetch in-demand skills", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  const content = (
    <div className={`w-full ${compact ? 'bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-6' : ''}`}>
      {/* Header */}
      <div className={`flex flex-col mb-10 ${compact ? '' : 'items-center text-center'}`}>
        <div className="max-w-2xl">
          <h2 className={`text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 tracking-tight ${compact ? '' : 'justify-center'}`}>
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Trends</span>
          </h2>
          <p className="text-gray-600 text-base md:text-lg">
            Select an industry below to discover the top skills employers are actively hiring for right now.
            Data is based on successfully hired candidates.
          </p>
        </div>
      </div>

      {/* Category Selector Pills */}
      <div className={`flex flex-wrap gap-2 mb-8 ${compact ? '' : 'justify-center'}`}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.label)}
            className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${selectedCategory === cat.label
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
              : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Graphs Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Skills Area Graph */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 relative">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Top 5 Skills in {selectedCategory || "Loading..."}
          </h3>

          {loadingSkills ? (
            <div className="h-[320px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : skillsData.length === 0 ? (
            <div className="h-[320px] flex flex-col items-center justify-center text-gray-500">
              <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-medium text-gray-600 text-lg">No skill data available</p>
              <p className="text-sm mt-1 text-center max-w-sm">
                We haven't recorded enough hiring data in the <strong>{selectedCategory}</strong> sector yet.
              </p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={skillsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis
                    dataKey="skill"
                    tick={{ fill: '#374151', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value, 'Jobseekers Hired']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Roles Bar Graph */}
        <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 relative">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Top 3 Roles in {selectedCategory || "Loading..."}
          </h3>

          {loadingSkills ? (
            <div className="h-[320px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : topJobs.length === 0 ? (
            <div className="h-[320px] flex flex-col items-center justify-center text-gray-500">
              <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
              <p className="font-medium text-gray-600 text-lg">No role data available</p>
              <p className="text-sm mt-1 text-center max-w-sm">
                No active jobs found for the <strong>{selectedCategory}</strong> sector yet.
              </p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topJobs} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="job"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
                    width={140}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [value, 'Jobs Listed']}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={40}>
                    {topJobs.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[(index + 3) % COLORS.length]}
                        style={{ transition: 'all 0.3s' }}
                        className="hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!compact) {
    return (
      <section className="relative bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30 py-16 md:py-24 w-full">
        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
          {content}
        </div>
      </section>
    );
  }

  return content;
};

export default InDemandSkillsGraph;
