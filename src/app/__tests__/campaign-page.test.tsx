import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import CampaignPage from "../(public)/[slug]/page";
import { getCampaignBySlug } from "../actions/campaign";

// Mock campaign actions
vi.mock("../actions/campaign", () => ({
  getCampaignBySlug: vi.fn(),
}));

// Mock mongoose settings find
vi.mock("@/lib/mongoose", () => ({
  Setting: {
    find: vi.fn().mockResolvedValue([
      { key: "copy_title", value: "Global Title" },
    ]),
  },
}));

// Mock GameContainer to inspect its props
vi.mock("@/components/GameContainer", () => ({
  default: ({ campaignSlug, initialPrizes, buttonText }: any) => (
    <div className="game-container-mock" data-campaign-slug={campaignSlug} data-prizes={JSON.stringify(initialPrizes)} data-button={buttonText}>
      Game Container
    </div>
  ),
}));

import { renderToStaticMarkup } from "react-dom/server";

describe("Campaign Page - Dynamic Rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render dynamic campaign page and pass correct prizes to GameContainer", async () => {
    const mockCampaign = {
      id: "camp_black_friday",
      name: "Black Friday Sale",
      slug: "black-friday",
      primaryColor: "#ab12cd",
      secondaryColor: "#78ef34",
      prizes: [
        { id: "p1", name: "BF Prize 1", weight: 1, stock: 5, isNoPrize: false },
        { id: "p2", name: "BF Prize 2 (No Stock)", weight: 1, stock: 0, isNoPrize: false },
        { id: "p3", name: "BF No Prize", weight: 1, stock: 0, isNoPrize: true },
      ],
    };

    (getCampaignBySlug as any).mockResolvedValue(mockCampaign);

    // Render page directly
    const result = await CampaignPage({ params: Promise.resolve({ slug: "black-friday" }) });

    // Assert getCampaignBySlug WAS called
    expect(getCampaignBySlug).toHaveBeenCalledWith("black-friday");

    // Inspect HTML output
    const html = renderToStaticMarkup(result);

    // Verify only in-stock or isNoPrize prizes are passed
    expect(html).toContain("BF Prize 1");
    expect(html).not.toContain("BF Prize 2 (No Stock)");
    expect(html).toContain("BF No Prize");

    // Verify campaign title
    expect(html).toContain("Global Title");

    // Verify campaignSlug is propagated to GameContainer
    expect(html).toContain('data-campaign-slug="black-friday"');
  });

  it("should render campaign-specific copy when defined instead of global settings", async () => {
    const mockCampaign = {
      id: "camp_custom_copy",
      name: "Custom Copy Campaign",
      slug: "custom-copy",
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      copyTitle: "Custom Campaign Title",
      copySubtitle: "Custom Campaign Subtitle",
      copyButton: "Spin Now!",
      prizes: [
        { id: "p1", name: "Prize 1", weight: 1, stock: 5, isNoPrize: false },
      ],
    };

    (getCampaignBySlug as any).mockResolvedValue(mockCampaign);

    const result = await CampaignPage({ params: Promise.resolve({ slug: "custom-copy" }) });

    expect(getCampaignBySlug).toHaveBeenCalledWith("custom-copy");

    const html = renderToStaticMarkup(result);

    // Verify campaign-specific copy is rendered
    expect(html).toContain("Custom Campaign Title");
    expect(html).toContain("Custom Campaign Subtitle");
    expect(html).toContain("Spin Now!");
    expect(html).not.toContain("Global Title");
  });

  it("should render campaign logo when campaign logo is present", async () => {
    const mockCampaign = {
      id: "camp_with_logo",
      name: "Logo Campaign",
      slug: "logo-camp",
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      logo: "/uploads/campaign-logo.png",
      prizes: [
        { id: "p1", name: "Prize 1", weight: 1, stock: 5, isNoPrize: false },
      ],
    };

    (getCampaignBySlug as any).mockResolvedValue(mockCampaign);

    const result = await CampaignPage({ params: Promise.resolve({ slug: "logo-camp" }) });

    const html = renderToStaticMarkup(result);

    // Verify the logo image is rendered with correct attributes
    expect(html).toContain('src="/uploads/campaign-logo.png"');
    expect(html).toContain('alt="Logo Campaign Logo"');
  });

  it("should not render logo container when campaign logo is absent", async () => {
    const mockCampaign = {
      id: "camp_no_logo",
      name: "No Logo Campaign",
      slug: "no-logo-camp",
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      logo: null,
      prizes: [
        { id: "p1", name: "Prize 1", weight: 1, stock: 5, isNoPrize: false },
      ],
    };

    (getCampaignBySlug as any).mockResolvedValue(mockCampaign);

    const result = await CampaignPage({ params: Promise.resolve({ slug: "no-logo-camp" }) });

    const html = renderToStaticMarkup(result);

    // Verify no campaign logo image is rendered
    expect(html).not.toContain('alt="No Logo Campaign Logo"');
  });

  it("should render inactive overlay and NOT render GameContainer when campaign is inactive", async () => {
    const mockCampaign = {
      id: "camp_inactive",
      name: "Inactive Campaign",
      slug: "inactive-camp",
      primaryColor: "#ffffff",
      secondaryColor: "#000000",
      isActive: false,
      prizes: [
        { id: "p1", name: "Prize 1", weight: 1, stock: 5, isNoPrize: false },
      ],
    };

    (getCampaignBySlug as any).mockResolvedValue(mockCampaign);

    const result = await CampaignPage({ params: Promise.resolve({ slug: "inactive-camp" }) });

    const html = renderToStaticMarkup(result);

    // Verify it renders the inactive campaign message
    expect(html).toContain("This campaign is currently inactive");
    
    // Verify it does NOT render the GameContainer
    expect(html).not.toContain("game-container-mock");
  });
});
