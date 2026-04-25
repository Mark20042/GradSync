import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("../../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../../../utils/apiPath", () => ({
  API_PATH: {
    EMPLOYER: {
      FAQS: "/employer/faqs",
      FAQ_ID: (id) => `/employer/faqs/${id}`,
      SETTINGS: "/employer/settings",
    },
    JOBS: {
      GET_JOBS_EMPLOYER: "/jobs/employer",
    },
  },
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import axiosInstance from "../../../utils/axiosInstance";
import JobFAQManager from "../JobFAQManager";
import toast from "react-hot-toast";

const mockFAQs = [
  {
    _id: "faq1",
    question: "What is the salary?",
    answer: "The salary ranges from ₱30,000 to ₱50,000.",
    job: null,
  },
  {
    _id: "faq2",
    question: "Is remote work available?",
    answer: "Yes, we offer full remote options.",
    job: { _id: "job1", title: "Frontend Developer" },
  },
];

const mockJobs = [
  { _id: "job1", title: "Frontend Developer" },
  { _id: "job2", title: "Backend Engineer" },
];

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockImplementation((url) => {
    if (url === "/employer/faqs") return Promise.resolve({ data: mockFAQs });
    if (url === "/jobs/employer") return Promise.resolve({ data: mockJobs });
    return Promise.reject(new Error("Unknown URL"));
  });
  axiosInstance.post.mockResolvedValue({ data: {} });
  axiosInstance.put.mockResolvedValue({ data: {} });
  axiosInstance.delete.mockResolvedValue({ data: {} });
});

describe("JobFAQManager", () => {
  describe("loading state", () => {
    it("shows loading indicator before data is fetched", () => {
      // Make the get call never resolve to keep component in loading state
      axiosInstance.get.mockReturnValue(new Promise(() => {}));
      render(<JobFAQManager />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe("after loading", () => {
    it("renders the component heading after loading", async () => {
      render(<JobFAQManager />);
      await waitFor(() => {
        expect(screen.getByText("Automated FAQs")).toBeInTheDocument();
      });
    });

    it("renders FAQ entries fetched from the API", async () => {
      render(<JobFAQManager />);
      await waitFor(() => {
        expect(screen.getByDisplayValue("What is the salary?")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Is remote work available?")).toBeInTheDocument();
      });
    });

    it("renders FAQ answers", async () => {
      render(<JobFAQManager />);
      await waitFor(() => {
        expect(
          screen.getByDisplayValue(/The salary ranges from ₱30,000/)
        ).toBeInTheDocument();
      });
    });

    it("renders job options in dropdown for each FAQ", async () => {
      render(<JobFAQManager />);
      await waitFor(() => {
        // Should have "All Jobs / General" option and job titles in the dropdowns
        const allJobsOptions = screen.getAllByText("All Jobs / General");
        expect(allJobsOptions.length).toBeGreaterThan(0);
      });
    });

    it("shows the empty state message when no FAQs exist", async () => {
      axiosInstance.get.mockImplementation((url) => {
        if (url === "/employer/faqs") return Promise.resolve({ data: [] });
        if (url === "/jobs/employer") return Promise.resolve({ data: mockJobs });
        return Promise.reject();
      });
      render(<JobFAQManager />);
      await waitFor(() => {
        expect(screen.getByText(/no faqs configured/i)).toBeInTheDocument();
      });
    });
  });

  describe("adding FAQs", () => {
    it("adds a new FAQ row when 'Add FAQ' is clicked", async () => {
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByText("Automated FAQs"));

      const addBtn = screen.getByRole("button", { name: /add faq/i });
      await user.click(addBtn);

      // Should now have one more question input field (empty)
      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/salary inquiry/i);
        expect(inputs.length).toBeGreaterThanOrEqual(1);
      });
    });

    it("adds multiple new FAQ rows on multiple clicks", async () => {
      const user = userEvent.setup();
      axiosInstance.get.mockImplementation((url) => {
        if (url === "/employer/faqs") return Promise.resolve({ data: [] });
        if (url === "/jobs/employer") return Promise.resolve({ data: [] });
        return Promise.reject();
      });
      render(<JobFAQManager />);
      await waitFor(() => screen.getByText(/no faqs configured/i));

      const addBtn = screen.getByRole("button", { name: /add faq/i });
      await user.click(addBtn);
      await user.click(addBtn);

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText(/salary inquiry/i);
        expect(inputs.length).toBe(2);
      });
    });
  });

  describe("deleting FAQs", () => {
    it("removes an FAQ row when the trash icon button is clicked (for existing FAQ)", async () => {
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByDisplayValue("What is the salary?"));

      const deleteButtons = screen.getAllByRole("button", { name: "" });
      // First delete button corresponds to first FAQ
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        // Should call delete API for existing FAQs
        expect(axiosInstance.delete).toHaveBeenCalledWith("/employer/faqs/faq1");
      });
    });

    it("shows success toast after deleting an FAQ", async () => {
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByDisplayValue("What is the salary?"));

      const deleteButtons = screen.getAllByRole("button", { name: "" });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("FAQ deleted");
      });
    });

    it("shows error toast when deletion fails", async () => {
      axiosInstance.delete.mockRejectedValueOnce(new Error("Failed"));
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByDisplayValue("What is the salary?"));

      const deleteButtons = screen.getAllByRole("button", { name: "" });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to delete FAQ");
      });
    });
  });

  describe("saving FAQs", () => {
    it("renders the 'Save Changes' button when FAQs exist", async () => {
      render(<JobFAQManager />);
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
      });
    });

    it("does not render 'Save Changes' when no FAQs", async () => {
      axiosInstance.get.mockImplementation((url) => {
        if (url === "/employer/faqs") return Promise.resolve({ data: [] });
        if (url === "/jobs/employer") return Promise.resolve({ data: [] });
        return Promise.reject();
      });
      render(<JobFAQManager />);
      await waitFor(() => screen.getByText(/no faqs configured/i));
      expect(screen.queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument();
    });

    it("calls axiosInstance.put for existing FAQs on save", async () => {
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByRole("button", { name: /save changes/i }));

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalled();
      });
    });

    it("shows success toast after saving FAQs", async () => {
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByRole("button", { name: /save changes/i }));

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("FAQs saved successfully");
      });
    });

    it("shows error toast when save fails", async () => {
      axiosInstance.put.mockRejectedValue(new Error("Server error"));
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByRole("button", { name: /save changes/i }));

      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save FAQs");
      });
    });

    it("calls axiosInstance.post for new (unsaved) FAQs on save", async () => {
      axiosInstance.get.mockImplementation((url) => {
        // Return no existing FAQs
        if (url === "/employer/faqs") return Promise.resolve({ data: [] });
        if (url === "/jobs/employer") return Promise.resolve({ data: mockJobs });
        return Promise.reject();
      });
      const user = userEvent.setup();
      render(<JobFAQManager />);
      await waitFor(() => screen.getByText(/no faqs configured/i));

      // Add a new FAQ
      await user.click(screen.getByRole("button", { name: /add faq/i }));

      // Fill in the new FAQ
      await waitFor(() => screen.getByPlaceholderText(/salary inquiry/i));
      await user.type(screen.getByPlaceholderText(/salary inquiry/i), "Benefits?");
      await user.type(screen.getByPlaceholderText(/the answer to send/i), "Great benefits!");

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(axiosInstance.post).toHaveBeenCalledWith(
          "/employer/faqs",
          expect.objectContaining({
            question: "Benefits?",
            answer: "Great benefits!",
          })
        );
      });
    });
  });
});