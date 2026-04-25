import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminModal from "../AdminModal";

// framer-motion uses animations; simplify by mocking
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }) => {
      // eslint-disable-next-line no-unused-vars
      const { initial, animate, exit, transition, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe("AdminModal", () => {
  describe("when isOpen is false", () => {
    it("renders nothing", () => {
      const { container } = render(
        <AdminModal isOpen={false} onClose={vi.fn()} title="Test" />
      );
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when isOpen is true", () => {
    it("renders the modal with the given title", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Create User">
          <p>Modal content</p>
        </AdminModal>
      );
      expect(screen.getByText("Create User")).toBeInTheDocument();
    });

    it("renders children inside the modal", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Test">
          <span data-testid="child-content">Hello World</span>
        </AdminModal>
      );
      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Hello World")).toBeInTheDocument();
    });

    it("calls onClose when the X button is clicked", async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      render(
        <AdminModal isOpen={true} onClose={mockOnClose} title="Test">
          <p>Content</p>
        </AdminModal>
      );

      // The close button contains an X icon; find it by role
      const closeButtons = screen.getAllByRole("button");
      // The X close button should be one of them
      const closeBtn = closeButtons.find((btn) => btn.querySelector("svg"));
      await user.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when the backdrop overlay is clicked", async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();
      render(
        <AdminModal isOpen={true} onClose={mockOnClose} title="Test">
          <p>Content</p>
        </AdminModal>
      );

      // The backdrop div has onClick={onClose}
      // It is the first div with the absolute inset-0 class containing the backdrop
      const backdrop = document.querySelector(".absolute.inset-0");
      if (backdrop) {
        await user.click(backdrop);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it("applies the default maxWidth class (max-w-lg)", () => {
      render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Test">
          <p>Content</p>
        </AdminModal>
      );
      // The modal content container should have max-w-lg
      const modal = document.querySelector(".max-w-lg");
      expect(modal).toBeInTheDocument();
    });

    it("applies a custom maxWidth class when provided", () => {
      render(
        <AdminModal
          isOpen={true}
          onClose={vi.fn()}
          title="Test"
          maxWidth="max-w-2xl"
        >
          <p>Content</p>
        </AdminModal>
      );
      const modal = document.querySelector(".max-w-2xl");
      expect(modal).toBeInTheDocument();
    });

    it("does not render when toggled from open to closed", () => {
      const { rerender, container } = render(
        <AdminModal isOpen={true} onClose={vi.fn()} title="Test">
          <p>Content</p>
        </AdminModal>
      );
      expect(screen.getByText("Test")).toBeInTheDocument();

      rerender(
        <AdminModal isOpen={false} onClose={vi.fn()} title="Test">
          <p>Content</p>
        </AdminModal>
      );
      expect(container).toBeEmptyDOMElement();
    });
  });
});