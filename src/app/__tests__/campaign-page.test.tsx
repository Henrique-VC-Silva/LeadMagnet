import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import CampaignPage from "../(public)/[slug]/page";
import { getCampaignBySlug } from "../actions/campaign";
import prisma from "@/lib/prisma";

// Mock campaign actions
vi.mock("../actions/campaign", () => ({
  getCampaignBySlug: vi.fn(),
}));

// Mock prisma settings findMany
vi.mock("@/lib/prisma", () => ({
  default: {
    setting: {
      findMany: vi.fn().mockResolvedValue([
        { key: "copy_title", value: "Global Title" },
      ]),
    },
  },
}));

// Mock GameContainer to inspect its props
vi.mock("@/components/GameContainer", () => ({
  default: ({ initialPrizes, buttonText }: any) => (
    <div className="game-container-mock" data-prizes={JSON.stringify(initialPrizes)} data-button={buttonText}>
      Game Container
    </div>
  ),
}));

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

    // Inspect JSX tree
    const json = JSON.stringify(result);

    // Verify only in-stock or isNoPrize prizes are passed (p1 and p3, not p2!)
    expect(json).toContain("BF Prize 1");
    expect(json).not.toContain("BF Prize 2 (No Stock)");
    expect(json).toContain("BF No Prize");

    // Verify campaign title
    expect(json).toContain("Global Title");
  });
});
