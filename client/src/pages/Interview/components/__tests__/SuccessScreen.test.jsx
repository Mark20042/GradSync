import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SuccessScreen from "../SuccessScreen";

// lucide-react renders SVGs; jsdom handles them fine
describe("SuccessScreen", () => {
  it("renders the 'Interview Submitted!' heading", () => {
    render(<SuccessScreen onDashboard={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: /interview submitted!/i })
    ).toBeInTheDocument();
  });

  it("renders the success message about AI analysis", () => {
    render(<SuccessScreen onDashboard={vi.fn()} />);
    expect(
      screen.getByText(/your answers have been successfully sent to our ai for analysis/i)
    ).toBeInTheDocument();
  });

  it("renders the 'Check your email' section", () => {
    render(<SuccessScreen onDashboard={vi.fn()} />);
    expect(screen.getByText(/check your email/i)).toBeInTheDocument();
    expect(
      screen.getByText(/detailed performance report/i)
    ).toBeInTheDocument();
  });

  it("renders the 'Back to Skill Center' button", () => {
    render(<SuccessScreen onDashboard={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: /back to skill center/i })
    ).toBeInTheDocument();
  });

  it("calls onDashboard when 'Back to Skill Center' button is clicked", async () => {
    const user = userEvent.setup();
    const mockOnDashboard = vi.fn();
    render(<SuccessScreen onDashboard={mockOnDashboard} />);

    const button = screen.getByRole("button", { name: /back to skill center/i });
    await user.click(button);

    expect(mockOnDashboard).toHaveBeenCalledTimes(1);
  });

  it("does not call onDashboard before the button is clicked", () => {
    const mockOnDashboard = vi.fn();
    render(<SuccessScreen onDashboard={mockOnDashboard} />);
    expect(mockOnDashboard).not.toHaveBeenCalled();
  });

  it("calls onDashboard each time the button is clicked multiple times", async () => {
    const user = userEvent.setup();
    const mockOnDashboard = vi.fn();
    render(<SuccessScreen onDashboard={mockOnDashboard} />);

    const button = screen.getByRole("button", { name: /back to skill center/i });
    await user.click(button);
    await user.click(button);

    expect(mockOnDashboard).toHaveBeenCalledTimes(2);
  });

  it("renders correctly when onDashboard is undefined (no crash)", () => {
    // Should render without throwing even if callback is not provided
    expect(() => render(<SuccessScreen />)).not.toThrow();
  });
});