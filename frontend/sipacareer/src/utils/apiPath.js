export const BASE_URL = "http://localhost:8000";

export const API_PATH = {
  AUTH: {
    REGISTER: "/api/auth/register", //Signup
    SETUP_GRAD_PROFILE: "/api/auth/setup-profile-grad", //Setup profile for graduates
    LOGIN: "/api/auth/login", //Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/me", //Get logged in user details
    UPDATE_PROFILE: "/api/users/profile", //Update profile details
    DELETE_ACCOUNT: "/api/users/profile", //Delete user account
    DELETE_RESUME: "/api/users/resume", //Delete resume
    UPLOAD_IMAGE: "/api/auth/upload-image", //Upload profile image
    UPLOAD_RESUME: "/api/auth/upload-resume", //Upload resume
  },

  USERS: {
    GET_PUBLIC_PROFILE: (id) => `/api/users/${id}`,
    GET_ALL_EMPLOYERS: "/api/users/employers",
  },



  DASHBOARD: {
    OVERVIEW: `/api/analytics/overview`,
  },

  JOBS: {
    GET_ALL_JOBS: "/api/jobs",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    GET_JOB_ID: (id) => `/api/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,

    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: "/api/save-jobs/my",
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    GET_APPLICATION_BY_ID: (id) => `/api/applications/${id}`,
    GET_MY_APPLICATIONS: "/api/applications/my",
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },
  IMAGE: {
    ULOAD_IMAGE: "/api/auth/upload-image",
  },
  CHAT: {
    GET_CONVERSATIONS: "/api/conversations",
    GET_MESSAGES: (conversationId) => `/api/messages/${conversationId}`,
    SEND_MESSAGE: "/api/messages", // This might not be used if using sockets, but good to have if we add a fallback
    FIND_OR_CREATE_CONVERSATION: "/api/conversations",
  },
  AI: {
    CHECK_SUITABILITY: "/api/ai/suitability",
    GENERATE_SUMMARY: "/api/ai/summary",
    SCAN_MATCHES: "/api/ai/scan-matches",
    MENTOR: "/api/ai/mentor",
    CHECK_CANDIDATE_SUITABILITY: "/api/ai/candidate-suitability",
  },
  NOTIFICATIONS: {
    GET_ALL: "/api/notifications",
    MARK_READ: (id) => `/api/notifications/${id}/read`,
  },
  ADMIN: {
    UPLOAD: "/api/admin/upload",
    ANALYTICS: "/api/admin/analytics",
    USERS: "/api/admin/users",
    CREATE_USER: "/api/admin/users",
    JOBS: "/api/admin/jobs",
    REPORTS: "/api/admin/reports",
    FAQS: "/api/admin/faqs",
    JOB_FAQS: "/api/admin/job-faqs",
    CREATE_JOB_FAQ: "/api/admin/job-faqs",
    UPDATE_JOB_FAQ: (id) => `/api/admin/job-faqs/${id}`,
    DELETE_JOB_FAQ: (id) => `/api/admin/job-faqs/${id}`,
    EMPLOYER_SETTINGS: "/api/admin/employer-settings",
    DELETE_USER: (id) => `/api/admin/users/${id}`,
    UPDATE_USER: (id) => `/api/admin/users/${id}`,
    USER_SAVED_JOBS: (id) => `/api/admin/users/${id}/saved-jobs`,
    DELETE_JOB: (id) => `/api/admin/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/admin/jobs/${id}`,
    CREATE_FAQ: "/api/admin/faqs",
    UPDATE_FAQ: (id) => `/api/admin/faqs/${id}`,
    DELETE_FAQ: (id) => `/api/admin/faqs/${id}`,
    CREATE_EMPLOYER_SETTINGS: "/api/admin/employer-settings",
    UPDATE_EMPLOYER_SETTINGS: (id) => `/api/admin/employer-settings/${id}`,
    // Employer Approval
    PENDING_EMPLOYERS: "/api/admin/pending-employers",
    APPROVE_EMPLOYER: (id) => `/api/admin/employers/${id}/approve`,
    REJECT_EMPLOYER: (id) => `/api/admin/employers/${id}/reject`,
  },
  EMPLOYER: {
    SETTINGS: "/api/employer/settings",
    FAQS: "/api/employer/faqs",
    FAQ_ID: (id) => `/api/employer/faqs/${id}`,
    GET_PUBLIC_FAQS: (employerId) => `/api/employer/${employerId}/public-faqs`,
  },
};
