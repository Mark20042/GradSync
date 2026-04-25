import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PublicJobCard from "../PublicJobCard";

const mockJob = {
  _id: "job1",
  title: "Data Analyst",
  location: "Cebu",
  type: "Full Time",
  category: "Technology",
  createdAt: "2024-03-20T10:00:00.000Z",
  company: {
    companyName: "TechCorp",
    companyLogo: null,
  },
};

describe("PublicJobCard", () => {
  it("renders the job title", () => {
    render(<PublicJobCard job={mockJob} onClick={vi.fn()} />);
    expect(screen.getByText("Data Analyst")).toBeInTheDocument();
  });

  it("renders the company name", () => {
    render(<PublicJobCard job={mockJob} onClick={vi.fn()} />);
    expect(screen.getByText("TechCorp")).toBeInTheDocument();
  });

  it("renders 'View Details' call to action", () => {
    render(<PublicJobCard job={mockJob} onClick={vi.fn()} />);
    expect(screen.getByText("View Details")).toBeInTheDocument();
  });

  it("renders the formatted creation date", () => {
    render(<PublicJobCard job={mockJob} onClick={vi.fn()} />);
    // moment formats "2024-03-20" as "20th Mar, 2024"
    expect(screen.getByText(/20th Mar, 2024/)).toBeInTheDocument();
  });

  it("calls onClick when the card is clicked", async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<PublicJobCard job={mockJob} onClick={mockOnClick} />);

    // Click the card container
    const card = screen.getByText("Data Analyst").closest("div[class]");
    await user.click(card);
    expect(mockOnClick).toHaveBeenCalled();
  });

  it("renders a fallback icon when companyLogo is null", () => {
    const { container } = render(
      <PublicJobCard job={{ ...mockJob, company: { companyName: "TechCorp", companyLogo: null } }} onClick={vi.fn()} />
    );
    // Should show the Building2 SVG icon, not an img tag
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders company logo image when companyLogo is provided", () => {
    const jobWithLogo = {
      ...mockJob,
      company: { companyName: "TechCorp", companyLogo: "http://example.com/logo.png" },
    };
    render(<PublicJobCard job={jobWithLogo} onClick={vi.fn()} />);
    const img = screen.getByRole("img", { name: /company logo/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://example.com/logo.png");
  });

  it("shows 'N/A' when createdAt is null", () => {
    render(
      <PublicJobCard job={{ ...mockJob, createdAt: null }} onClick={vi.fn()} />
    );
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("applies extra className when provided", () => {
    const { container } = render(
      <PublicJobCard
        job={mockJob}
        onClick={vi.fn()}
        className="extra-class"
      />
    );
    const card = container.firstChild;
    expect(card).toHaveClass("extra-class");
  });
});