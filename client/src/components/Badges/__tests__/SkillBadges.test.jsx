import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  EntryBadge,
  MidBadge,
  SeniorBadge,
  ExpertBadge,
  getBadgeComponent,
} from "../SkillBadges";

describe("SkillBadges - individual badge components", () => {
  describe("EntryBadge", () => {
    it("renders an SVG element", () => {
      const { container } = render(<EntryBadge />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders with default size 20", () => {
      const { container } = render(<EntryBadge />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("renders with a custom size", () => {
      const { container } = render(<EntryBadge size={40} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "40");
      expect(svg).toHaveAttribute("height", "40");
    });

    it("renders the shield path (green checkmark badge)", () => {
      const { container } = render(<EntryBadge />);
      // Should contain a path for the shield shape
      const paths = container.querySelectorAll("path");
      expect(paths.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("MidBadge", () => {
    it("renders an SVG element", () => {
      const { container } = render(<MidBadge />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders with default size 20", () => {
      const { container } = render(<MidBadge />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("renders with a custom size", () => {
      const { container } = render(<MidBadge size={32} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "32");
      expect(svg).toHaveAttribute("height", "32");
    });

    it("renders a circle element (medal shape)", () => {
      const { container } = render(<MidBadge />);
      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("SeniorBadge", () => {
    it("renders an SVG element", () => {
      const { container } = render(<SeniorBadge />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders with default size 20", () => {
      const { container } = render(<SeniorBadge />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("renders with a custom size", () => {
      const { container } = render(<SeniorBadge size={48} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "48");
      expect(svg).toHaveAttribute("height", "48");
    });

    it("renders circles (gems) on the crown", () => {
      const { container } = render(<SeniorBadge />);
      const circles = container.querySelectorAll("circle");
      // Has 3 gem circles on the crown
      expect(circles.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("ExpertBadge", () => {
    it("renders an SVG element", () => {
      const { container } = render(<ExpertBadge />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("renders with default size 20", () => {
      const { container } = render(<ExpertBadge />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "20");
      expect(svg).toHaveAttribute("height", "20");
    });

    it("renders with a custom size", () => {
      const { container } = render(<ExpertBadge size={64} />);
      const svg = container.querySelector("svg");
      expect(svg).toHaveAttribute("width", "64");
      expect(svg).toHaveAttribute("height", "64");
    });
  });
});

describe("getBadgeComponent", () => {
  it("returns EntryBadge for 'Entry'", () => {
    const Badge = getBadgeComponent("Entry");
    expect(Badge).toBe(EntryBadge);
  });

  it("returns MidBadge for 'Mid'", () => {
    const Badge = getBadgeComponent("Mid");
    expect(Badge).toBe(MidBadge);
  });

  it("returns SeniorBadge for 'Senior'", () => {
    const Badge = getBadgeComponent("Senior");
    expect(Badge).toBe(SeniorBadge);
  });

  it("returns ExpertBadge for 'Expert'", () => {
    const Badge = getBadgeComponent("Expert");
    expect(Badge).toBe(ExpertBadge);
  });

  it("returns EntryBadge as the default for an unknown level", () => {
    const Badge = getBadgeComponent("Unknown");
    expect(Badge).toBe(EntryBadge);
  });

  it("returns EntryBadge as the default for undefined", () => {
    const Badge = getBadgeComponent(undefined);
    expect(Badge).toBe(EntryBadge);
  });

  it("returns EntryBadge as the default for null", () => {
    const Badge = getBadgeComponent(null);
    expect(Badge).toBe(EntryBadge);
  });

  it("returns EntryBadge as the default for empty string", () => {
    const Badge = getBadgeComponent("");
    expect(Badge).toBe(EntryBadge);
  });

  it("the returned component renders as a valid React element", () => {
    const Badge = getBadgeComponent("Senior");
    const { container } = render(<Badge size={24} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});