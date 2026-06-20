import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import Lottie from "lottie-react";
import welcomeBirdieAnimation from "./assets/animations/welcomebirdie.json";
import LandingPage from "./pages/LandingPage/LandingPage";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import SetupProfileGrad from "./pages/Auth/SetupProfileGrad";
import SetupProfileJobseeker from "./pages/Auth/SetupProfileJobseeker";
import JobSeekerDashboard from "./pages/Graduates/Jobseeker/JobSeekerDashboard";
import JobDetails from "./pages/Graduates/Jobseeker/JobDetails";
import SavedJobs from "./pages/Graduates/Jobseeker/SavedJobs";
import UserProfile from "./pages/Graduates/Jobseeker/UserProfile";
import JobPostingForm from "./pages/Employer/JobPostingForm";
import ManageJobs from "./pages/Employer/ManageJobs";
import EmployerDashboard from "./pages/Employer/EmployerDashboard";
import ApplicationViewer from "./pages/Employer/ApplicationViewer";
import EmployerProfilePage from "./pages/Employer/EmployerProfilePage";
import ApplicantProfile from "./pages/Employer/ApplicantProfile";
import EmployerAnalytics from "./pages/Employer/EmployerAnalytics";

import EmployerAutoPilot from "./pages/Employer/EmployerAutoPilot";
import ConversationList from "./pages/Graduates/Jobseeker/ConversationList";
import EmployerMessages from "./pages/Employer/EmployerMessages";
import Messages from "./pages/Graduates/Jobseeker/Messages";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import AdminRoute from "./routes/AdminRoute";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/Admin/AdminUsers";
import AdminJobs from "./pages/Admin/AdminJobs";
import AdminApplications from "./pages/Admin/AdminApplications";
import AdminReports from "./pages/Admin/AdminReports";
import AdminFAQs from "./pages/Admin/AdminFAQs";
import AdminEmployerSettings from "./pages/Admin/AdminEmployerSettings";

import MyApplications from "./pages/Graduates/Jobseeker/MyApplications";
import CompanyProfileView from "./pages/Graduates/Jobseeker/CompanyProfileView";
const ResumeBuilder = lazy(() => import("./pages/Graduates/Jobseeker/ResumeBuilder"));
import AssessmentList from "./pages/Assessment/AssessmentList";
import AssessmentTaking from "./pages/Assessment/AssessmentTaking";

import InterviewRoom from "./pages/Interview/InterviewRoom";
import InterviewResults from "./pages/Interview/InterviewResults";
import AdminAssessmentManager from "./pages/Admin/AdminAssessmentManager";
import AdminAssessmentReview from "./pages/Admin/AdminAssessmentReview";
import AdminInterviewQuestions from "./pages/Admin/AdminInterviewQuestions";
import AdminInterviewScores from "./pages/Admin/AdminInterviewScores";
import AdminFeatureFeedbacks from "./pages/Admin/AdminFeatureFeedbacks";
import AdminAIResourceCenter from "./pages/Admin/AdminAIResourceCenter";
import AdminTerminations from "./pages/Admin/AdminTerminations";
import AdminEmployerAnalytics from "./pages/Admin/AdminEmployerAnalytics";
import FeatureFeedbackModal from "./components/FeatureFeedbackModal";

const App = () => {
  return (
    <AuthProvider>
      <FeatureFeedbackModal />
      <Router>
        <Suspense
          fallback={
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
              <Lottie
                animationData={welcomeBirdieAnimation}
                loop={true}
                style={{ width: 300, height: 300 }}
              />
              <p className="text-gray-600 text-lg font-medium mt-4">
                It may take sometime to load
              </p>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes for Graduates & Job Seekers */}
            <Route element={<ProtectedRoute requiredRoles={["graduate", "jobseeker"]} />}>
              <Route
                path="/setup-profile-grad"
                element={<SetupProfileGrad />}
              />
              <Route
                path="/setup-profile-jobseeker"
                element={<SetupProfileJobseeker />}
              />
              <Route path="/find-jobs" element={<JobSeekerDashboard />} />
              <Route path="/job/:jobId" element={<JobDetails />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/messages" element={<ConversationList />} />
              <Route path="/messages/:conversationId" element={<Messages />} />
              <Route path="/company/:id" element={<CompanyProfileView />} />
              <Route path="/resume-builder" element={<ResumeBuilder />} />
              <Route path="/assessments" element={<AssessmentList />} />
              <Route path="/assessment-taking" element={<AssessmentTaking />} />
              <Route path="/interview-room" element={<InterviewRoom />} />
              <Route path="/interview-results" element={<InterviewResults />} />
            </Route>

            {/* Protected Routes for Employers */}
            <Route element={<ProtectedRoute requiredRole="employer" />}>
              <Route
                path="/employer-dashboard"
                element={<EmployerDashboard />}
              />
              <Route path="/employer-analytics" element={<EmployerAnalytics />} />
              <Route path="/post-job" element={<JobPostingForm />} />
              <Route path="/manage-jobs" element={<ManageJobs />} />
              <Route path="/applicants" element={<ApplicationViewer />} />
              <Route path="/applicant-profile" element={<ApplicantProfile />} />
              <Route
                path="/company-profile"
                element={<EmployerProfilePage />}
              />
              <Route path="/employer-messages" element={<EmployerMessages />} />
              <Route path="/company/:id" element={<CompanyProfileView />} />

              <Route path="/employer-auto-pilot" element={<EmployerAutoPilot />} />
            </Route>

            {/* Protected Routes for Admin */}
            <Route element={<AdminRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/admin-users" element={<AdminUsers />} />

              <Route path="/admin-jobs" element={<AdminJobs />} />
              <Route
                path="/admin-applications"
                element={<AdminApplications />}
              />
              <Route path="/admin-reports" element={<AdminReports />} />
              <Route path="/admin-faqs" element={<AdminFAQs />} />
              <Route
                path="/admin-employer-settings"
                element={<AdminEmployerSettings />}
              />
              <Route
                path="/admin-ai-feedbacks"
                element={<AdminFeatureFeedbacks />}
              />
              <Route
                path="/admin-assessments"
                element={<AdminAssessmentManager />}
              />
              <Route
                path="/admin-assessment-review"
                element={<AdminAssessmentReview />}
              />
              <Route
                path="/admin-terminations"
                element={<AdminTerminations />}
              />
              <Route
                path="/admin-employer-analytics"
                element={<AdminEmployerAnalytics />}
              />
              <Route
                path="/admin-interview-questions"
                element={<AdminInterviewQuestions />}
              />
              <Route
                path="/admin-interview-scores"
                element={<AdminInterviewScores />}
              />
              <Route
                path="/admin-ai-resource-center"
                element={<AdminAIResourceCenter />}
              />
            </Route>

            {/* catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
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
