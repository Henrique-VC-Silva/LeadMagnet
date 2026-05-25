import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth FIRST
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

// Mock mongoose models
vi.mock("@/lib/mongoose", () => {
  const mockCampaignInstance = {
    toObject: vi.fn(function(this: any) { return this; }),
  };

  return {
    Campaign: {
      create: vi.fn(),
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue([]),
        })),
      })),
      findOne: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(null),
      })),
      findByIdAndUpdate: vi.fn(),
      findByIdAndDelete: vi.fn(),
    },
    Prize: {
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue([]),
        })),
      })),
      deleteMany: vi.fn(),
    },
    Lead: {
      deleteMany: vi.fn(),
    },
  };
});

import { createCampaign, getCampaigns, getCampaignBySlug, updateCampaign, deleteCampaign } from "../campaign";
import { Campaign, Prize, Lead } from "@/lib/mongoose";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Campaign Actions - Mongoose CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create campaign correctly using Mongoose", async () => {
    const data = {
      name: "Black Friday Roulette",
      slug: "black-friday",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
      defaultLanguage: "fr",
    };

    const mockSaved = { _id: "camp_1", ...data, logo: null, toObject: () => ({ id: "camp_1", ...data, logo: null }) };
    (Campaign.create as any).mockResolvedValue(mockSaved);

    const result = await createCampaign(data);

    expect(Campaign.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        defaultLanguage: "fr",
      })
    );
    expect(result.id).toEqual("camp_1");
  });

  it("should fetch campaign by slug and link its prizes", async () => {
    const mockCampaign = { _id: "1", name: "C1", slug: "c-slug", primaryColor: "#1", secondaryColor: "#2" };
    const mockPrizes = [
      { _id: "p1", name: "Prize 1", weight: 1, stock: 5, isNoPrize: false, campaignId: "1" },
    ];

    const mockFindOneQuery = {
      lean: vi.fn().mockResolvedValue(mockCampaign),
    };
    (Campaign.findOne as any).mockReturnValue(mockFindOneQuery);

    const mockPrizeQuery = {
      sort: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(mockPrizes),
      })),
    };
    (Prize.find as any).mockReturnValue(mockPrizeQuery);

    const result = await getCampaignBySlug("c-slug");

    expect(Campaign.findOne).toHaveBeenCalledWith({ slug: "c-slug" });
    expect(Prize.find).toHaveBeenCalledWith({ campaignId: "1" });
    expect(result.prizes[0].id).toBe("p1");
  });

  it("should delete campaign and its linked prizes/leads", async () => {
    const mockCampaign = { _id: "camp_1", name: "To Delete", slug: "to-delete" };
    (Campaign.findByIdAndDelete as any).mockResolvedValue(mockCampaign);

    const result = await deleteCampaign("camp_1");

    expect(Lead.deleteMany).toHaveBeenCalledWith({ campaignId: "camp_1" });
    expect(Prize.deleteMany).toHaveBeenCalledWith({ campaignId: "camp_1" });
    expect(Campaign.findByIdAndDelete).toHaveBeenCalledWith("camp_1");
    expect(result.id).toEqual("camp_1");
  });
});
