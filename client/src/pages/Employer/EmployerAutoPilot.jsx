import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import AvailabilityScheduler from "./components/AvailabilityScheduler";
import JobFAQManager from "./components/JobFAQManager";

const EmployerAutoPilot = () => {
  return (
    <DashboardLayout activeMenu="employer-auto-pilot">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Availability & Auto-Reply</h2>
            <AvailabilityScheduler />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Automated FAQs</h2>
            <JobFAQManager />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployerAutoPilot;
