import React from 'react';
import { AlertTriangle, XCircle, AlertCircle, X } from 'lucide-react';

const ViolationWarning = ({ violationCount, violationType, onClose }) => {
  const getWarningConfig = () => {
    switch (violationCount) {
      case 1:
        return {
          title: "First Warning",
          message: "Tab switching detected. Please stay focused on the assessment. You have 2 warnings remaining.",
          icon: AlertCircle,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-300",
          iconColor: "text-yellow-600",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700"
        };
      case 2:
        return {
          title: "Final Warning",
          message: "Second violation detected. One more violation will result in automatic submission and your assessment will be flagged for review.",
          icon: AlertTriangle,
          bgColor: "bg-orange-50",
          borderColor: "border-orange-300",
          iconColor: "text-orange-600",
          buttonColor: "bg-orange-600 hover:bg-orange-700"
        };
      case 3:
        return {
          title: "Assessment Terminated",
          message: "Three violations detected. Your assessment has been automatically submitted and will be reviewed by an administrator before results are released.",
          icon: XCircle,
          bgColor: "bg-red-50",
          borderColor: "border-red-300",
          iconColor: "text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700"
        };
      default:
        return {
          title: "Warning",
          message: "Violation detected.",
          icon: AlertCircle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-300",
          iconColor: "text-gray-600",
          buttonColor: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const config = getWarningConfig();
  const Icon = config.icon;

  const getViolationTypeText = () => {
    switch (violationType) {
      case 'tab-switch':
        return 'Tab Switch';
      case 'window-blur':
        return 'Window Focus Lost';
      case 'copy-paste':
        return 'Copy/Paste Attempt';
      case 'right-click':
        return 'Right Click';
      case 'devtools':
        return 'Developer Tools';
      default:
        return 'Violation';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 sm:p-6 animate-in fade-in duration-200">
      <div className={`${config.bgColor} border-2 ${config.borderColor} rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-[95%] sm:w-full p-4 sm:p-6 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 ${config.bgColor} rounded-xl flex items-center justify-center border-2 ${config.borderColor} shrink-0`}>
              <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-base sm:text-lg md:text-xl font-bold ${config.iconColor} m-0 leading-tight`}>{config.title}</h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-gray-600 mt-1 m-0">Violation Type: {getViolationTypeText()}</p>
            </div>
          </div>
          {violationCount < 3 && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 p-1"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>

        {/* Message */}
        <div className="mb-5 sm:mb-6">
          <p className="text-gray-700 text-xs sm:text-sm leading-relaxed m-0">
            {config.message}
          </p>
        </div>

        {/* Strike Indicator */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 uppercase">Violations</span>
            <span className={`text-xs sm:text-sm font-bold ${config.iconColor}`}>{violationCount} / 3</span>
          </div>
          <div className="flex gap-1 sm:gap-2">
            {[1, 2, 3].map((strike) => (
              <div
                key={strike}
                className={`flex-1 h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  strike <= violationCount
                    ? strike === 1
                      ? 'bg-yellow-500'
                      : strike === 2
                      ? 'bg-orange-500'
                      : 'bg-red-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 sm:py-3 px-4 ${config.buttonColor} text-white text-sm sm:text-base font-semibold rounded-xl transition-all shadow-lg active:scale-[0.98]`}
        >
          {violationCount < 3 ? 'I Understand - Continue' : 'Close'}
        </button>

        {/* Additional Info for Strike 3 */}
        {violationCount === 3 && (
          <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl border border-red-200 shadow-inner">
            <p className="text-[11px] sm:text-xs text-gray-600 m-0 leading-relaxed">
              <strong className="block text-red-700 mb-1">What happens next:</strong>
              Your answers have been saved and submitted. An administrator will review your assessment attempt and the violation log before releasing your results.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationWarning;
