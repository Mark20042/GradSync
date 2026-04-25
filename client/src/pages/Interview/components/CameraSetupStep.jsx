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
    <div className="animate-in fade-in max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Check Your Setup
        </h1>
        <p className="text-slate-500">
          Make sure your camera and microphone are working properly.
        </p>
      </div>

      {!hasSpeechRecognition && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl mb-6 text-sm text-left">
          ⚠️ Speech-to-Text is not supported in this browser. Please use
          <strong> Chrome</strong> or <strong>Edge</strong> for the best experience.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 mb-6">
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
              <VideoOff size={48} className="text-slate-500" />
            </div>
          )}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${camActive ? "bg-emerald-400" : "bg-red-400"}`} />
            {camActive ? "Camera Active" : "Camera Off"}
          </div>
        </div>

        {/* Device Controls */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={toggleMic}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer border-2 ${
              micActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            }`}
          >
            {micActive ? <Mic size={20} /> : <MicOff size={20} />}
            {micActive ? "Microphone On" : "Microphone Off"}
          </button>
          <button
            onClick={toggleCam}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer border-2 ${
              camActive
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            }`}
          >
            {camActive ? <VideoIcon size={20} /> : <VideoOff size={20} />}
            {camActive ? "Camera On" : "Camera Off"}
          </button>
        </div>

        {/* Device Status Checklist */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            stream ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {stream ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {stream ? "Devices Connected" : "No Device Access"}
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            micActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
          }`}>
            {micActive ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {micActive ? "Microphone Ready" : "Mic Disabled"}
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            camActive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-600"
          }`}>
            {camActive ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {camActive ? "Camera Ready" : "Camera Disabled"}
          </div>
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${
            hasSpeechRecognition ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
          }`}>
            {hasSpeechRecognition ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            {hasSpeechRecognition ? "STT Supported" : "STT Not Supported"}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 bg-white border-2 border-slate-200 text-slate-600 font-bold py-4 px-6 rounded-2xl text-base transition-all hover:border-slate-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <button
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl text-base transition-all hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
          onClick={onStart}
        >
          Start Interview <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default CameraSetupStep;
