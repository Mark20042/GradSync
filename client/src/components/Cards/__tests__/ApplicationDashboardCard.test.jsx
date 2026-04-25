import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ApplicationDashboardCard from "../ApplicationDashboardCard";

describe("ApplicationDashboardCard", () => {
  const mockApplicant = { fullName: "Jane Smith" };
  const mockPosition = "Frontend Developer";
  const mockTime = "2 hours ago";

  it("renders the position", () => {
    render(
      <ApplicationDashboardCard
        applicant={mockApplicant}
        position={mockPosition}
        time={mockTime}
      />
    );
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("renders the time", () => {
    render(
      <ApplicationDashboardCard
        applicant={mockApplicant}
        position={mockPosition}
        time={mockTime}
      />
    );
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("renders initials from applicant fullName", () => {
    render(
      <ApplicationDashboardCard
        applicant={{ fullName: "Jane Smith" }}
        position={mockPosition}
        time={mockTime}
      />
    );
    // Initials "JS" from "Jane Smith"
    expect(screen.getByText("JS")).toBeInTheDocument();
  });

  it("renders initials for a single-word name", () => {
    render(
      <ApplicationDashboardCard
        applicant={{ fullName: "Madonna" }}
        position={mockPosition}
        time={mockTime}
      />
    );
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders initials for a three-word name", () => {
    render(
      <ApplicationDashboardCard
        applicant={{ fullName: "Mary Jane Watson" }}
        position={mockPosition}
        time={mockTime}
      />
    );
    // Should show "MJW"
    expect(screen.getByText("MJW")).toBeInTheDocument();
  });

  it("renders without crashing when applicant is undefined", () => {
    expect(() =>
      render(
        <ApplicationDashboardCard
          applicant={undefined}
          position={mockPosition}
          time={mockTime}
        />
      )
    ).not.toThrow();
  });

  it("renders without crashing when fullName is undefined", () => {
    expect(() =>
      render(
        <ApplicationDashboardCard
          applicant={{}}
          position={mockPosition}
          time={mockTime}
        />
      )
    ).not.toThrow();
  });
});