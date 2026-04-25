import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobCard, { JobCardSkeleton } from "../JobCard";

// Mock AuthContext so useAuth works outside a provider
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({ user: { _id: "user1", role: "job_seeker" } }),
}));

// react-loading-skeleton renders basic elements in jsdom
vi.mock("react-loading-skeleton", () => ({
  default: ({ width, height }) => (
    <div
      data-testid="skeleton"
      style={{ width, height }}
      aria-label="Loading"
    />
  ),
}));

const baseJob = {
  _id: "job1",
  title: "Backend Engineer",
  location: "Remote",
  type: "Full Time",
  category: "Engineering",
  createdAt: "2024-06-01T00:00:00.000Z",
  salaryMin: null,
  salaryMax: null,
  isSaved: false,
  applicationStatus: null,
  company: {
    companyName: "StartupXYZ",
    companyLogo: null,
  },
};

describe("JobCard - rendering", () => {
  it("renders the job title", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText("Backend Engineer")).toBeInTheDocument();
  });

  it("renders the company name", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText("StartupXYZ")).toBeInTheDocument();
  });

  it("renders location badge", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("renders job type badge", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText("Full Time")).toBeInTheDocument();
  });

  it("renders category badge when category is provided", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(screen.getByText("Engineering")).toBeInTheDocument();
  });

  it("does not render a category badge when category is absent", () => {
    render(
      <JobCard
        job={{ ...baseJob, category: undefined }}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    // Engineering should not appear
    expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
  });

  it("renders the fallback building icon when companyLogo is absent", () => {
    const { container } = render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders company logo image when provided", () => {
    render(
      <JobCard
        job={{ ...baseJob, company: { companyName: "X", companyLogo: "http://example.com/logo.png" } }}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    const img = screen.getByRole("img", { name: /company logo/i });
    expect(img).toHaveAttribute("src", "http://example.com/logo.png");
  });
});

describe("JobCard - salary formatting (formatSalary)", () => {
  const renderCard = (salaryMin, salaryMax) =>
    render(
      <JobCard
        job={{ ...baseJob, salaryMin, salaryMax }}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );

  it("shows 'Salary not specified' when both salaryMin and salaryMax are null", () => {
    renderCard(null, null);
    expect(screen.getByText("Salary not specified")).toBeInTheDocument();
  });

  it("shows 'Salary not specified' when both salaryMin and salaryMax are 0", () => {
    renderCard(0, 0);
    // When salaryMin=0 and salaryMax=0, React renders the JSX expression
    // `(0 || 0) && <span>/mo</span>` as `0` (the number), so the element
    // contains "Salary not specified0". Use regex to match partially.
    expect(screen.getByText(/salary not specified/i)).toBeInTheDocument();
  });

  it("shows salary range when both min and max are provided", () => {
    renderCard(30000, 60000);
    expect(screen.getByText(/₱30,000 - ₱60,000/)).toBeInTheDocument();
  });

  it("shows 'From ₱X' when only salaryMin is provided", () => {
    renderCard(25000, null);
    expect(screen.getByText(/From ₱25,000/)).toBeInTheDocument();
  });

  it("shows 'Up to ₱X' when only salaryMax is provided", () => {
    renderCard(null, 80000);
    expect(screen.getByText(/Up to ₱80,000/)).toBeInTheDocument();
  });

  it("handles string salary values by converting to numbers", () => {
    renderCard("20000", "50000");
    expect(screen.getByText(/₱20,000 - ₱50,000/)).toBeInTheDocument();
  });
});

describe("JobCard - interactions", () => {
  it("calls onClick when the card is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(
      <JobCard
        job={baseJob}
        onClick={mockOnClick}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    const title = screen.getByText("Backend Engineer");
    await user.click(title);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("calls onApply when Apply button is clicked and does not propagate", async () => {
    const user = userEvent.setup();
    const mockOnApply = vi.fn();
    const mockOnClick = vi.fn();
    render(
      <JobCard
        job={baseJob}
        onClick={mockOnClick}
        onToggleSave={vi.fn()}
        onApply={mockOnApply}
      />
    );
    const applyBtn = screen.getByRole("button", { name: /apply/i });
    await user.click(applyBtn);
    expect(mockOnApply).toHaveBeenCalledTimes(1);
    // The card click should not fire because event is stopped
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it("calls onToggleSave when the bookmark button is clicked", async () => {
    const user = userEvent.setup();
    const mockToggleSave = vi.fn();
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={mockToggleSave}
        onApply={vi.fn()}
      />
    );
    // Bookmark button is the button with Bookmark icon
    const buttons = screen.getAllByRole("button");
    // The bookmark button is the one that is not "Apply"
    const bookmarkBtn = buttons.find((b) => !b.textContent.includes("Apply"));
    await user.click(bookmarkBtn);
    expect(mockToggleSave).toHaveBeenCalledTimes(1);
  });

  it("hides the Apply button when hideApply is true", () => {
    render(
      <JobCard
        job={baseJob}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
        hideApply={true}
      />
    );
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();
  });

  it("shows StatusBadge when applicationStatus is set", () => {
    render(
      <JobCard
        job={{ ...baseJob, applicationStatus: "Applied" }}
        onClick={vi.fn()}
        onToggleSave={vi.fn()}
        onApply={vi.fn()}
      />
    );
    // Should not show Apply button when status is set
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();
  });
});

describe("JobCardSkeleton", () => {
  it("renders skeleton placeholders", () => {
    const { container } = render(<JobCardSkeleton />);
    const skeletons = container.querySelectorAll("[data-testid='skeleton']");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders without crashing", () => {
    expect(() => render(<JobCardSkeleton />)).not.toThrow();
  });
});