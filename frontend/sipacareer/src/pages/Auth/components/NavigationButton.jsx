// components/NavigationButtons.js
import React from "react";
import { ChevronLeft, ChevronRight, Loader } from "lucide-react";

const NavigationButton = ({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
  loading,
}) => {
  return (
    <div className="flex justify-between pt-8 border-t border-gray-200">
      <button
        type="button"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="flex items-center px-5 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </button>

      {currentStep < totalSteps ? (
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="flex items-center px-5 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center px-5 py-3 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Complete Profile"
          )}
        </button>
      )}
    </div>
  );
};

export default NavigationButton;
