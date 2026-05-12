import React from 'react';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import welcomeBirdieAnimation from "../assets/animations/welcomebirdie.json";

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-64 h-64 mx-auto mb-4">
          <DotLottieReact
            data={welcomeBirdieAnimation}
            loop
            autoplay
          />
        </div>
        <p className="text-gray-600 font-semibold text-lg animate-pulse">
          Finding amazing opportunities...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
