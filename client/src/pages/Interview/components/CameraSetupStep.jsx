import React from "react";
import { Camera, VideoOff, Mic, MicOff, Video as VideoIcon, CheckCircle, AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";

const CameraSetupStep = ({
  previewRef,
  camActive,
  micActive,
  stream,
  hasSpeechRecognition,
  toggleCam,
  toggleMic,
  onBack,
  onStart
}) => {
  return (
    <div className="animate-in fade-in max-w-2xl w-[95%] sm:w-full mx-auto px-2 sm:px-0">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
          Check Your Setup
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          Make sure your camera and microphone are working properly.
        </p>
      </div>

      {!hasSpeechRecognition && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl mb-4 sm:mb-6 text-xs sm:text-sm text-left">
          ⚠️ Speech-to-Text is not supported in this browser. Please use
          <strong> Chrome</strong> or <strong>Edge</strong> for the best experience.
        </div>
      )}

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-100 p-4 sm:p-6 mb-6">
        {/* Camera Preview */}
        <div className="w-full max-w-[440px] aspect-video bg-slate-900 rounded-xl mx-auto mb-6 overflow-hidden border border-slate-200 relative">
          <video
            ref={previewRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover -scale-x-100"
          />
          {!camActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <VideoOff className="w-8 h-8 sm:w-12 sm:h-12 text-slate-500" />
            </div>
          )}
          <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-semibold py-1 sm:py-1.5 px-2 sm:px-3 rounded-lg flex items-center gap-1.5 sm:gap-2">
            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${camActive ? "bg-emerald-400" : "bg-red-400"}`} />
            {camActive ? "Camera Active" : "Camera Off"}
          </div>
        </div>

        {/* Device Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
          <button
            onClick={toggleMic}
            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-2 ${micActive
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
          >
            {micActive ? <Mic className="w-4 h-4 sm:w-5 sm:h-5" /> : <MicOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            {micActive ? "Microphone On" : "Microphone Off"}
          </button>
          <button
            onClick={toggleCam}
            className={`flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer border-2 ${camActive
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
              : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
              }`}
          >
            {camActive ? <VideoIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" />}
            {camActive ? "Camera On" : "Camera Off"}
          </button>
        </div>

        {/* Device Status Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${stream ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}>
            {stream ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {stream ? "Devices Connected" : "No Device Access"}
          </div>
          <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${micActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
            }`}>
            {micActive ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {micActive ? "Microphone Ready" : "Mic Disabled"}
          </div>
          <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${camActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
            }`}>
            {camActive ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {camActive ? "Camera Ready" : "Camera Disabled"}
          </div>
          <div className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium ${hasSpeechRecognition ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
            }`}>
            {hasSpeechRecognition ? <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" /> : <AlertTriangle size={16} className="sm:w-[18px] sm:h-[18px]" />}
            {hasSpeechRecognition ? "STT Supported" : "STT Not Supported"}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all hover:border-slate-300 cursor-pointer flex items-center justify-center gap-2 order-last sm:order-none"
        >
          <ArrowLeft size={18} /> Previous
        </button>
        <button
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl text-sm sm:text-base transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          onClick={onStart}
        >
          Start Interview <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CameraSetupStep;
