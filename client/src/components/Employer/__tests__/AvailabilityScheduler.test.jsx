import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock axiosInstance before importing the component
vi.mock("../../../utils/axiosInstance", () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock("../../../utils/apiPath", () => ({
  API_PATH: {
    EMPLOYER: {
      SETTINGS: "/employer/settings",
      FAQS: "/employer/faqs",
      GET_PUBLIC_FAQS: (id) => `/employer/${id}/faqs/public`,
      FAQ_ID: (id) => `/employer/faqs/${id}`,
    },
    JOBS: {
      GET_JOBS_EMPLOYER: "/jobs/employer",
      UPDATE_JOB: (id) => `/jobs/${id}`,
    },
  },
}));

// react-schedule-selector does DOM things that jsdom can't fully support
vi.mock("react-schedule-selector", () => ({
  default: ({ selection, onChange }) => (
    <div data-testid="schedule-selector">
      <span data-testid="schedule-count">{selection.length} slots selected</span>
      <button onClick={() => onChange([])}>Clear Schedule</button>
    </div>
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import axiosInstance from "../../../utils/axiosInstance";
import AvailabilityScheduler from "../AvailabilityScheduler";
import toast from "react-hot-toast";

const mockSettingsResponse = {
  data: {
    autoReplyMessage: "We are currently offline. We will respond shortly.",
    businessHours: {
      monday: { isOpen: true, start: "09:00", end: "17:00" },
      tuesday: { isOpen: true, start: "09:00", end: "17:00" },
      wednesday: { isOpen: false, start: "09:00", end: "17:00" },
      thursday: { isOpen: false, start: "09:00", end: "17:00" },
      friday: { isOpen: true, start: "09:00", end: "17:00" },
      saturday: { isOpen: false, start: "09:00", end: "17:00" },
      sunday: { isOpen: false, start: "09:00", end: "17:00" },
    },
  },
};

const mockJobsResponse = {
  data: [
    { _id: "job1", title: "Frontend Developer", autoReplyMessage: "" },
    { _id: "job2", title: "Backend Engineer", autoReplyMessage: "Thanks for your message!" },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  axiosInstance.get.mockImplementation((url) => {
    if (url === "/employer/settings") return Promise.resolve(mockSettingsResponse);
    if (url === "/jobs/employer") return Promise.resolve(mockJobsResponse);
    return Promise.reject(new Error("Unknown URL"));
  });
  axiosInstance.put.mockResolvedValue({ data: {} });
});

describe("AvailabilityScheduler", () => {
  describe("initial render", () => {
    it("fetches settings and jobs on mount", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(axiosInstance.get).toHaveBeenCalledWith("/employer/settings");
        expect(axiosInstance.get).toHaveBeenCalledWith("/jobs/employer");
      });
    });

    it("displays the auto-reply message textarea", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter the message/i)).toBeInTheDocument();
      });
    });

    it("pre-fills the auto-reply message from settings", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/enter the message/i);
        expect(textarea.value).toBe(
          "We are currently offline. We will respond shortly."
        );
      });
    });

    it("renders the weekly availability section", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByText("Weekly Availability")).toBeInTheDocument();
      });
    });

    it("renders the schedule selector", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByTestId("schedule-selector")).toBeInTheDocument();
      });
    });

    it("renders job options in the context select dropdown", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
        expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      });
    });

    it("renders the 'Default (Global)' option in the context dropdown", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByRole("option", { name: "Default (Global)" })).toBeInTheDocument();
      });
    });
  });

  describe("job-specific auto-reply", () => {
    it("shows job-specific auto-reply message when a job is selected", async () => {
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => {
        expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
      });

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "job2");

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/enter specific auto-reply/i);
        expect(textarea.value).toBe("Thanks for your message!");
      });
    });

    it("shows 'Save Job Reply' button when a specific job is selected", async () => {
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Backend Engineer"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "job1");

      expect(screen.getByRole("button", { name: /save job reply/i })).toBeInTheDocument();
    });

    it("hides 'Save Job Reply' button when no job is selected (default context)", async () => {
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Frontend Developer"));
      expect(screen.queryByRole("button", { name: /save job reply/i })).not.toBeInTheDocument();
    });

    it("calls axiosInstance.put when 'Save Job Reply' is clicked", async () => {
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Frontend Developer"));

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "job1");

      const saveBtn = screen.getByRole("button", { name: /save job reply/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalled();
      });
    });
  });

  describe("save settings", () => {
    it("calls axiosInstance.put when 'Save Settings' button is clicked", async () => {
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Save Settings"));

      const saveBtn = screen.getByRole("button", { name: /save settings/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(axiosInstance.put).toHaveBeenCalledWith(
          "/employer/settings",
          expect.objectContaining({
            autoReplyMessage: expect.any(String),
            businessHours: expect.any(Object),
          })
        );
      });
    });

    it("shows success toast after saving settings", async () => {
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Save Settings"));

      const saveBtn = screen.getByRole("button", { name: /save settings/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Settings saved");
      });
    });

    it("shows error toast when save settings fails", async () => {
      axiosInstance.put.mockRejectedValueOnce(new Error("Network error"));
      const user = userEvent.setup();
      render(<AvailabilityScheduler />);
      await waitFor(() => screen.getByText("Save Settings"));

      const saveBtn = screen.getByRole("button", { name: /save settings/i });
      await user.click(saveBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Failed to save settings");
      });
    });
  });

  describe("error handling", () => {
    it("handles failure to fetch settings gracefully", async () => {
      axiosInstance.get.mockRejectedValue(new Error("Server down"));
      expect(() => render(<AvailabilityScheduler />)).not.toThrow();
    });
  });
});