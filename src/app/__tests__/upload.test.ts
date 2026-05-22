import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../api/admin/upload/route";
import { getServerSession } from "next-auth";
import { writeFile, mkdir } from "fs/promises";

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

describe("API Endpoint - Admin File Upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authorized as ADMIN", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("should return 400 when no file is provided", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const formData = new FormData();

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toEqual({ error: "No file provided" });
  });

  it("should return 400 when file format is not an image", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const formData = new FormData();
    const file = new File(["test content"], "document.pdf", { type: "application/pdf" });
    formData.append("file", file);

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toEqual({ error: "Invalid file type. Only images are allowed." });
  });

  it("should return 400 when file size exceeds 5MB", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const formData = new FormData();
    const largeContent = new Uint8Array(6 * 1024 * 1024);
    const file = new File([largeContent], "large-image.png", { type: "image/png" });
    formData.append("file", file);

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(400);

    const json = await response.json();
    expect(json).toEqual({ error: "File too large. Maximum size is 5MB." });
  });

  it("should save file and return relative path when valid image is provided", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const formData = new FormData();
    const file = new File(["fake-image-bytes"], "test-bg.png", { type: "image/png" });
    formData.append("file", file);

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.url).toMatch(/^\/uploads\/\d+_test-bg\.png$/);

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });

  it("should save file and return relative path when valid SVG image is provided", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const formData = new FormData();
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="red"/></svg>`;
    const file = new File([svgContent], "logo.svg", { type: "image/svg+xml" });
    formData.append("file", file);

    const mockRequest = new Request("http://localhost/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const response = await POST(mockRequest);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.url).toMatch(/^\/uploads\/\d+_logo\.svg$/);

    expect(mkdir).toHaveBeenCalled();
    expect(writeFile).toHaveBeenCalled();
  });
});
