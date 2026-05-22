import React from 'react';
import toast from 'react-hot-toast';
import { ShieldAlert, X } from 'lucide-react';

export const showIntegrityWarningToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-sm w-full bg-white shadow-2xl rounded-xl pointer-events-auto flex overflow-hidden border border-red-100 ring-1 ring-black/5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
            <div className="ml-1 flex-1">
              <p className="text-sm font-bold text-slate-900 mb-1">
                Integrity Violation Detected
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Suspicious activity was recorded. Multiple violations may result in automatic rejection upon submission.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-100">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    ),
    { id: 'violation-warning', duration: 5000 }
  );
};
