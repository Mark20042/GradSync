import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobPostingPreview from "../JobPostingPreview";

// Mock useAuth - user without a company logo for base tests
vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { _id: "emp1", companyName: "TestCorp", companyLogo: null },
  }),
}));

// Mock utils/data so CATEGORIES and JOB_TYPES are available
vi.mock("../../../utils/data", () => ({
  CATEGORIES: [
    { value: "tech", label: "Technology" },
    { value: "finance", label: "Finance" },
  ],
  JOB_TYPES: [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
  ],
}));

const baseFormData = {
  title: "Senior React Developer",
  location: "Manila, Philippines",
  category: "tech",
  type: "full-time",
  description: "We are looking for an experienced React developer.",
  requirements: "3+ years of React experience.",
  salaryMin: "",
  salaryMax: "",
};

describe("JobPostingPreview", () => {
  it("renders the job title from formData", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("Senior React Developer")).toBeInTheDocument();
  });

  it("renders the job location", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("Manila, Philippines")).toBeInTheDocument();
  });

  it("renders the category label from CATEGORIES", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  it("renders the job type label from JOB_TYPES", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("Full Time")).toBeInTheDocument();
  });

  it("renders the job description", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(
      screen.getByText("We are looking for an experienced React developer.")
    ).toBeInTheDocument();
  });

  it("renders the job requirements", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("3+ years of React experience.")).toBeInTheDocument();
  });

  it("renders 'Posted today' tag", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByText("Posted today")).toBeInTheDocument();
  });

  it("renders 'Back to Edit' button", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.getByRole("button", { name: /back to edit/i })).toBeInTheDocument();
  });

  it("calls setIsPreview(false) when 'Back to Edit' is clicked", async () => {
    const user = userEvent.setup();
    const mockSetIsPreview = vi.fn();
    render(<JobPostingPreview formData={baseFormData} setIsPreview={mockSetIsPreview} />);

    const btn = screen.getByRole("button", { name: /back to edit/i });
    await user.click(btn);
    expect(mockSetIsPreview).toHaveBeenCalledWith(false);
  });

  it("does not render salary section when both salaryMin and salaryMax are empty", () => {
    render(<JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />);
    expect(screen.queryByText(/salary range/i)).not.toBeInTheDocument();
  });

  it("renders salary range section when salaryMin is provided", () => {
    render(
      <JobPostingPreview
        formData={{ ...baseFormData, salaryMin: "30000", salaryMax: "60000" }}
        setIsPreview={vi.fn()}
      />
    );
    expect(screen.getByText(/salary range/i)).toBeInTheDocument();
    expect(screen.getByText(/₱30000 - ₱60000/)).toBeInTheDocument();
  });

  it("renders a fallback building icon when user has no companyLogo", () => {
    const { container } = render(
      <JobPostingPreview formData={baseFormData} setIsPreview={vi.fn()} />
    );
    // No img tag, but SVG should be present
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});