import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import SetupProfileGrad from "./pages/Auth/SetupProfileGrad";
import JobSeekerDashboard from "./pages/JobSeeker/JobSeekerDashboard";
import JobDetails from "./pages/JobSeeker/JobDetails";
import SavedJobs from "./pages/JobSeeker/SavedJobs";
import AIMentorChat from "./pages/JobSeeker/AIMentorChat";
import UserProfile from "./pages/JobSeeker/UserProfile";
import JobPostingForm from "./pages/Employer/JobPostingForm";
import ManageJobs from "./pages/Employer/ManageJobs";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import ApplicationViewer from "./pages/Employer/ApplicationViewer";
import EmployerProfilePage from "./pages/Employer/EmployerProfilePage";
import ApplicantProfile from "./pages/Employer/ApplicantProfile";
import ConversationList from "./pages/JobSeeker/ConversationList";
import EmployerMessages from "./pages/Employer/EmployerMessages";
import Messages from "./pages/JobSeeker/Messages";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminJobs from "./pages/Admin/AdminJobs";
import AdminReports from "./pages/Admin/AdminReports";
import AdminFAQs from "./pages/Admin/AdminFAQs";
import AdminEmployerSettings from "./pages/Admin/AdminEmployerSettings";
import MyApplications from "./pages/JobSeeker/MyApplications";
import CompanyProfileView from "./pages/JobSeeker/CompanyProfileView";
import ResumeBuilder from "./pages/JobSeeker/ResumeBuilder";



const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />


          {/* Protected Routes for Graduates */}
          <Route element={<ProtectedRoute requiredRole="graduate" />}>
            <Route path="/setup-profile-grad" element={<SetupProfileGrad />} />
            <Route path="/find-jobs" element={<JobSeekerDashboard />} />
            <Route path="/job/:jobId" element={<JobDetails />} />
            <Route path="/saved-jobs" element={<SavedJobs />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/ai-mentor" element={<AIMentorChat />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/messages" element={<ConversationList />} />
            <Route path="/messages/:conversationId" element={<Messages />} />
            <Route path="/company/:id" element={<CompanyProfileView />} />
            <Route path="/resume-builder" element={<ResumeBuilder />} />

          </Route>

          {/* Protected Routes for Employers */}
          <Route element={<ProtectedRoute requiredRole="employer" />}>
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/post-job" element={<JobPostingForm />} />
            <Route path="/manage-jobs" element={<ManageJobs />} />
            <Route path="/applicants" element={<ApplicationViewer />} />
            <Route path="/applicant-profile" element={<ApplicantProfile />} />
            <Route path="/company-profile" element={<EmployerProfilePage />} />
            <Route path="/employer-messages" element={<EmployerMessages />} />
            <Route path="/company/:id" element={<CompanyProfileView />} />
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-users" element={<AdminUsers />} />
            <Route path="/admin-jobs" element={<AdminJobs />} />
            <Route path="/admin-reports" element={<AdminReports />} />
            <Route path="/admin-faqs" element={<AdminFAQs />} />
            <Route path="/admin-employer-settings" element={<AdminEmployerSettings />} />
          </Route>

          {/* catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster
        toastOptions={{
          className: "",
          style: {
            fontSize: "13px",
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
