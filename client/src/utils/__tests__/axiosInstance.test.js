import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiPath module so BASE_URL is predictable in tests
vi.mock("../apiPath", () => ({
  BASE_URL: "http://localhost:8001",
}));

// Mock axios to avoid actual network calls
vi.mock("axios", () => {
  const mockAxiosInstance = {
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Import after mocks are set up
const { fixLegacyUrls } = await import("../axiosInstance.js");

describe("fixLegacyUrls", () => {
  describe("string handling", () => {
    it("replaces localhost:8000 with BASE_URL in a plain string", () => {
      const input = "http://localhost:8000/some/path";
      const result = fixLegacyUrls(input);
      expect(result).toBe("http://localhost:8001/some/path");
    });

    it("replaces all occurrences of localhost:8000 in a string", () => {
      const input =
        "http://localhost:8000/a and http://localhost:8000/b";
      const result = fixLegacyUrls(input);
      expect(result).toBe("http://localhost:8001/a and http://localhost:8001/b");
    });

    it("prepends BASE_URL to paths starting with /uploads/", () => {
      const input = "/uploads/avatars/user123.png";
      const result = fixLegacyUrls(input);
      expect(result).toBe("http://localhost:8001/uploads/avatars/user123.png");
    });

    it("returns strings unchanged if no legacy URLs present", () => {
      const input = "https://example.com/image.png";
      const result = fixLegacyUrls(input);
      expect(result).toBe("https://example.com/image.png");
    });

    it("returns empty string unchanged", () => {
      expect(fixLegacyUrls("")).toBe("");
    });

    it("does not modify strings that start with /something-else/ (not /uploads/)", () => {
      const input = "/static/logo.png";
      const result = fixLegacyUrls(input);
      expect(result).toBe("/static/logo.png");
    });

    it("handles a URL with localhost:8000 that also starts with /uploads/ after replacement", () => {
      // If the string starts with http://localhost:8000/uploads/, it should be rewritten via the regex
      const input = "http://localhost:8000/uploads/test.jpg";
      const result = fixLegacyUrls(input);
      expect(result).toBe("http://localhost:8001/uploads/test.jpg");
    });

    it("does not double-prefix /uploads/ paths that already have the correct BASE_URL", () => {
      const input = "http://localhost:8001/uploads/test.jpg";
      const result = fixLegacyUrls(input);
      // Should remain unchanged since localhost:8001 is not matched by the 8000 regex
      expect(result).toBe("http://localhost:8001/uploads/test.jpg");
    });
  });

  describe("array handling", () => {
    it("recursively fixes all string items in an array", () => {
      const input = [
        "http://localhost:8000/img1.jpg",
        "/uploads/img2.jpg",
        "https://other.com/img3.jpg",
      ];
      const result = fixLegacyUrls(input);
      expect(result).toEqual([
        "http://localhost:8001/img1.jpg",
        "http://localhost:8001/uploads/img2.jpg",
        "https://other.com/img3.jpg",
      ]);
    });

    it("handles an empty array", () => {
      expect(fixLegacyUrls([])).toEqual([]);
    });

    it("handles nested arrays", () => {
      const input = [["http://localhost:8000/a.jpg"], ["/uploads/b.jpg"]];
      const result = fixLegacyUrls(input);
      expect(result).toEqual([
        ["http://localhost:8001/a.jpg"],
        ["http://localhost:8001/uploads/b.jpg"],
      ]);
    });
  });

  describe("object handling", () => {
    it("recursively fixes string values in a plain object", () => {
      const input = {
        avatar: "http://localhost:8000/uploads/avatar.png",
        name: "John Doe",
      };
      const result = fixLegacyUrls(input);
      expect(result).toEqual({
        avatar: "http://localhost:8001/uploads/avatar.png",
        name: "John Doe",
      });
    });

    it("handles deeply nested objects", () => {
      const input = {
        user: {
          profile: {
            avatar: "http://localhost:8000/uploads/profile.jpg",
          },
          resume: "/uploads/resume.pdf",
        },
        title: "Software Engineer",
      };
      const result = fixLegacyUrls(input);
      expect(result).toEqual({
        user: {
          profile: {
            avatar: "http://localhost:8001/uploads/profile.jpg",
          },
          resume: "http://localhost:8001/uploads/resume.pdf",
        },
        title: "Software Engineer",
      });
    });

    it("handles objects with mixed value types (string, number, boolean, null)", () => {
      const input = {
        url: "http://localhost:8000/file.jpg",
        count: 42,
        active: true,
        deletedAt: null,
      };
      const result = fixLegacyUrls(input);
      expect(result).toEqual({
        url: "http://localhost:8001/file.jpg",
        count: 42,
        active: true,
        deletedAt: null,
      });
    });

    it("handles an empty object", () => {
      expect(fixLegacyUrls({})).toEqual({});
    });

    it("handles objects containing arrays", () => {
      const input = {
        images: [
          "http://localhost:8000/img1.jpg",
          "/uploads/img2.jpg",
        ],
      };
      const result = fixLegacyUrls(input);
      expect(result).toEqual({
        images: [
          "http://localhost:8001/img1.jpg",
          "http://localhost:8001/uploads/img2.jpg",
        ],
      });
    });
  });

  describe("primitive passthrough", () => {
    it("returns numbers unchanged", () => {
      expect(fixLegacyUrls(42)).toBe(42);
      expect(fixLegacyUrls(0)).toBe(0);
    });

    it("returns booleans unchanged", () => {
      expect(fixLegacyUrls(true)).toBe(true);
      expect(fixLegacyUrls(false)).toBe(false);
    });

    it("returns null unchanged", () => {
      expect(fixLegacyUrls(null)).toBe(null);
    });

    it("returns undefined unchanged", () => {
      expect(fixLegacyUrls(undefined)).toBe(undefined);
    });
  });

  describe("real-world message payload", () => {
    it("fixes URLs in a realistic chat message object", () => {
      const message = {
        _id: "msg123",
        conversationId: "conv456",
        senderId: "user789",
        content: "Hello!",
        senderAvatar: "http://localhost:8000/uploads/avatars/user789.jpg",
        attachments: ["/uploads/files/resume.pdf"],
        createdAt: "2024-01-01T10:00:00.000Z",
      };
      const result = fixLegacyUrls(message);
      expect(result.senderAvatar).toBe(
        "http://localhost:8001/uploads/avatars/user789.jpg"
      );
      expect(result.attachments[0]).toBe(
        "http://localhost:8001/uploads/files/resume.pdf"
      );
      expect(result._id).toBe("msg123");
      expect(result.content).toBe("Hello!");
    });
  });
});