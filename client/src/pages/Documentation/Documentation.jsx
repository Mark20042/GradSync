import React from 'react';
import { Book, GraduationCap, Briefcase, PlayCircle, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">GradSync Tutorials</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log In</Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-800/50 rounded-2xl mb-6 backdrop-blur-sm border border-blue-700/50">
            <Smartphone className="w-8 h-8 text-blue-300 mr-3" />
            <PlayCircle className="w-8 h-8 text-blue-300" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How to use GradSync</h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-2xl mx-auto mb-10">
            Watch our official mobile app demonstrations. Learn how to set up your profile, apply for jobs, and connect with employers using the GradSync mobile experience.
          </p>
        </div>
      </div>

      {/* Videos Section */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full -mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">

          {/* Fresh Graduates Demo */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Fresh Graduates</h2>
              </div>
              <p className="text-gray-600">Step-by-step guide on building your first resume, taking AI assessments, and discovering entry-level roles.</p>
            </div>
            <div className="relative w-full aspect-video bg-gray-900 flex-1">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src=""
                title="GradSync Tutorial for Fresh Graduates"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Job Seekers Demo */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">For Job Seekers</h2>
              </div>
              <p className="text-gray-600">Learn how to browse advanced listings, communicate with recruiters, and stand out in the competitive job market.</p>
            </div>
            <div className="relative w-full aspect-video bg-gray-900 flex-1">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/LJsy5gxMjsM"
                title="GradSync Tutorial for Job Seekers"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
          </div>

        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gray-900 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto text-lg">Join thousands of others who have successfully launched their careers with GradSync.</p>
          <Link to="/signup" className="inline-flex items-center justify-center bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/50 text-lg">
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
