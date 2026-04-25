import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import JobDashboardCard from "../JobDashboardCard";

const mockJob = {
  title: "Software Engineer",
  location: "Manila",
  createdAt: "2024-01-15T10:00:00.000Z",
  isClosed: false,
};

describe("JobDashboardCard", () => {
  it("renders the job title", () => {
    render(<JobDashboardCard job={mockJob} />);
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("renders the job location", () => {
    render(<JobDashboardCard job={mockJob} />);
    expect(screen.getByText(/Manila/)).toBeInTheDocument();
  });

  it("shows 'Active' status badge for open jobs (isClosed = false)", () => {
    render(<JobDashboardCard job={{ ...mockJob, isClosed: false }} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows 'Closed' status badge for closed jobs (isClosed = true)", () => {
    render(<JobDashboardCard job={{ ...mockJob, isClosed: true }} />);
    expect(screen.getByText("Closed")).toBeInTheDocument();
  });

  it("does not show 'Closed' text for active jobs", () => {
    render(<JobDashboardCard job={{ ...mockJob, isClosed: false }} />);
    expect(screen.queryByText("Closed")).not.toBeInTheDocument();
  });

  it("does not show 'Active' text for closed jobs", () => {
    render(<JobDashboardCard job={{ ...mockJob, isClosed: true }} />);
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("renders the formatted creation date", () => {
    render(<JobDashboardCard job={mockJob} />);
    // moment formats "2024-01-15" as "15th Jan, 2024"
    expect(screen.getByText(/15th Jan, 2024/)).toBeInTheDocument();
  });
});