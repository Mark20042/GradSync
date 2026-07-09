import React, { useState } from 'react';
import { GraduationCap, Briefcase, PlayCircle, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const CustomVideoPlayer = ({ videoId, title }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (isPlaying) {
    return (
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    );
  }

  return (
    <div
      className="absolute top-0 left-0 w-full h-full cursor-pointer group bg-gray-900"
      onClick={() => setIsPlaying(true)}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600/90 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
          <PlayCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1" />
        </div>
      </div>
    </div>
  );
};

const Documentation = () => {
  const [activeTab, setActiveTab] = useState('freshGrads');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <div className="bg-white relative">
        <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-6 border border-blue-100">
            <Smartphone className="w-8 h-8 text-blue-600 mr-3" />
            <PlayCircle className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 text-gray-900 tracking-tight">How to use GradSync</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Watch our official mobile app demonstrations. Learn how to set up your profile, apply for jobs, and connect with employers using the GradSync mobile experience.
          </p>
        </div>
      </div>

      {/* Videos Section - Tabbed Interface */}
      <div className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">

        {/* Tab Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('freshGrads')}
            className={`flex items-center justify-center gap-3 px-6 py-3 font-bold transition-all ${activeTab === 'freshGrads'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            <GraduationCap className="w-5 h-5" />
            Fresh Graduates
          </button>
          <button
            onClick={() => setActiveTab('jobSeekers')}
            className={`flex items-center justify-center gap-3 px-6 py-3 font-bold transition-all ${activeTab === 'jobSeekers'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            <Briefcase className="w-5 h-5" />
            Job Seekers
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex flex-col gap-6">
          {activeTab === 'freshGrads' && (
            <>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">For Fresh Graduates</h2>
                <p className="text-gray-600">Step-by-step guide on building your first resume, taking AI assessments, and discovering entry-level roles.</p>
              </div>
              <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50">
                <CustomVideoPlayer videoId="LJsy5gxMjsM" title="GradSync Tutorial for Fresh Graduates" />
              </div>
            </>
          )}

          {activeTab === 'jobSeekers' && (
            <>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">For Job Seekers</h2>
                <p className="text-gray-600">Learn how to browse advanced listings, communicate with recruiters, and stand out in the competitive job market.</p>
              </div>
              <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-lg shadow-gray-200/50">
                <CustomVideoPlayer videoId="QZSYA4VNJ-8" title="GradSync Tutorial for Job Seekers" />
              </div>
            </>
          )}
        </div>

      </div>

    </div>
  );
};

export default Documentation;
