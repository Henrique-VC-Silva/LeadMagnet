import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import RootLayout from "../layout";
import { getThemeSettings } from "../actions/settings";

// Mock Next.js fonts
vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

// Mock the settings actions
vi.mock("../actions/settings", () => ({
  getThemeSettings: vi.fn().mockResolvedValue({
    primary_color: "#ff6b6b",
    secondary_color: "#4ecdc4",
    font_family: "system-ui",
  }),
}));

describe("RootLayout - Isolate Stylesheets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not call getThemeSettings during root rendering", async () => {
    // Render the Server Component directly
    const result = await RootLayout({ children: <div>Test Child</div> });

    // Assert getThemeSettings was NOT called
    expect(getThemeSettings).not.toHaveBeenCalled();
  });
});

import PublicLayout from "../(public)/layout";

describe("PublicLayout - Load Dynamic Stylesheets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call getThemeSettings during public layout rendering", async () => {
    // Render the Server Component directly
    const result = await PublicLayout({ children: <div>Test Public Child</div> });

    // Assert getThemeSettings WAS called
    expect(getThemeSettings).toHaveBeenCalledTimes(1);
    
    // Assert style tag is rendered
    expect(JSON.stringify(result)).toContain("style");
  });
});
