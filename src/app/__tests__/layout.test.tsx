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

import PublicCampaignLayout from "../(public)/[slug]/layout";
import { getCampaignBySlug } from "../actions/campaign";

// Mock campaign actions
vi.mock("../actions/campaign", () => ({
  getCampaignBySlug: vi.fn().mockResolvedValue({
    id: "1",
    name: "Summer Campaign",
    slug: "summer",
    primaryColor: "#ab12cd",
    secondaryColor: "#78ef34",
  }),
}));

describe("PublicCampaignLayout - Load Dynamic Campaign Stylesheets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch campaign details and inject custom colors", async () => {
    // Render the Server Component directly
    const result = await PublicCampaignLayout({
      children: <div>Test Campaign Child</div>,
      params: Promise.resolve({ slug: "summer" }),
    });

    // Assert getCampaignBySlug WAS called with correct slug
    expect(getCampaignBySlug).toHaveBeenCalledWith("summer");

    // Assert custom primary and secondary colors are injected in style tag
    const json = JSON.stringify(result);
    expect(json).toContain("#ab12cd");
    expect(json).toContain("#78ef34");
  });

  it("should inject background-image when campaign has backgroundImage set", async () => {
    (getCampaignBySlug as any).mockResolvedValueOnce({
      id: "2",
      name: "Image Campaign",
      slug: "with-bg",
      primaryColor: "#111111",
      secondaryColor: "#222222",
      backgroundImage: "https://example.com/custom-bg.png",
    });

    const result = await PublicCampaignLayout({
      children: <div>With BG</div>,
      params: Promise.resolve({ slug: "with-bg" }),
    });

    const json = JSON.stringify(result);
    expect(json).toContain("background-image:");
    expect(json).toContain("https://example.com/custom-bg.png");
  });
});
