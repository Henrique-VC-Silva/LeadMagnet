import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import AdminCampaignDetailsPage from "../admin/campaigns/[id]/page";

// Mock next-auth
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// Mock mongoose Campaign and Prize
vi.mock("@/lib/mongoose", () => {
  const mockCampaign = {
    _id: "camp_123",
    name: "Summer Campaign Details",
    slug: "summer-deals",
    primaryColor: "#ff0000",
    secondaryColor: "#000000",
  };

  return {
    Campaign: {
      findById: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(mockCampaign),
      })),
    },
    Prize: {
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
  };
});

import { Campaign, Prize } from "@/lib/mongoose";

// Mock child component to inspect rendering
vi.mock("@/components/admin/CampaignDetailsTabs", () => ({
  default: ({ campaign }: any) => (
    <div className="tabs-mock" data-campaign={JSON.stringify(campaign)}>
      Campaign Details Tabs Mock
    </div>
  ),
}));

import { renderToStaticMarkup } from "react-dom/server";

describe("Admin Campaign Details Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch campaign details by ID and mount tabs component", async () => {
    const result = await AdminCampaignDetailsPage({
      params: Promise.resolve({ id: "camp_123" }),
    });

    // Verify findById database call
    expect(Campaign.findById).toHaveBeenCalledWith("camp_123");
    expect(Prize.find).toHaveBeenCalledWith({ campaignId: "camp_123" });

    // Inspect dynamic elements in JSX
    const html = renderToStaticMarkup(result);
    expect(html).toContain("Summer Campaign Details");
    expect(html).toContain("Back to Dashboard");
  });
});
