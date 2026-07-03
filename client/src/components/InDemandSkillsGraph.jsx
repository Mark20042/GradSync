import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { Briefcase, Activity, BarChart2, Hexagon, TrendingUp } from 'lucide-react';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#f59e0b', '#eab308', '#84cc16'];

const InDemandSkillsGraph = ({ compact = false }) => {
  const [categories, setCategories] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSkills(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    setLoadingCats(true);
    try {
      const res = await axiosInstance.get(`/api/analytics/public/job-categories`);
      const data = res.data.data || [];
      setCategories(data);
      if (data.length > 0) {
        setSelectedCategory(data[0].category);
      }
    } catch (err) {
      console.error("Failed to fetch job categories", err);
    } finally {
      setLoadingCats(false);
    }
  };

  const fetchSkills = async (category) => {
    setLoadingSkills(true);
    try {
      const res = await axiosInstance.get(`/api/analytics/public/in-demand-skills?category=${encodeURIComponent(category)}`);
      setSkillsData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch in-demand skills", err);
    } finally {
      setLoadingSkills(false);
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden ${compact ? 'p-6' : 'p-8'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2 mb-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            In-Demand Skills by Industry
          </h2>
          <p className="text-gray-500">
            Select an industry below to discover the top skills employers are actively hiring for right now. 
            Data is based on successfully hired candidates.
          </p>
        </div>
        <div className="flex bg-gray-50 border border-gray-200 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setChartType('bar')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${chartType === 'bar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <BarChart2 className="w-4 h-4" /> Bar
          </button>
          <button
            onClick={() => setChartType('radar')}
            className={`p-2 rounded-lg transition-all flex items-center gap-2 text-sm font-medium ${chartType === 'radar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Hexagon className="w-4 h-4" /> Radar
          </button>
        </div>
      </div>

      {/* Category Selector Pills */}
      {loadingCats ? (
        <div className="flex gap-3 mb-8 overflow-hidden">
          {[1,2,3,4,5].map(i => <div key={i} className="h-10 w-24 bg-gray-100 animate-pulse rounded-full"></div>)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-gray-500 bg-gray-50 p-4 rounded-xl mb-8">No categories available.</div>
      ) : (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 border ${
                selectedCategory === cat.category
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              {cat.category}
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedCategory === cat.category ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Skills Graph Container */}
      <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 relative">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          Top Skills in {selectedCategory || "Loading..."}
        </h3>

        {loadingSkills ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : skillsData.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-gray-500">
            <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
            <p className="font-medium text-gray-600 text-lg">No skill data available</p>
            <p className="text-sm mt-1 text-center max-w-sm">
              We haven't recorded enough hiring data in the <strong>{selectedCategory}</strong> sector yet to determine skill trends.
            </p>
          </div>
        ) : (
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart
                  data={skillsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="skill" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
                    width={140}
                  />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Jobseekers Hired`, 'Frequency']}
                  />
                  <Bar 
                    dataKey="count" 
                    radius={[0, 8, 8, 0]} 
                    barSize={32}
                  >
                    {skillsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        style={{ transition: 'all 0.3s' }} 
                        className="hover:opacity-80 cursor-pointer"
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillsData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="skill" 
                    tick={{ fill: '#374151', fontSize: 13, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value} Jobseekers Hired`, 'Frequency']}
                  />
                  <Radar 
                    name="Hired Candidates"
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fill="url(#colorDemand)" 
                    fillOpacity={0.6} 
                    activeDot={{ r: 6, fill: '#4f46e5', stroke: '#fff', strokeWidth: 2 }}
                  />
                  <defs>
                    <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </RadarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default InDemandSkillsGraph;
