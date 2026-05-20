import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth FIRST
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

import { createCampaign, getCampaigns, getCampaignBySlug } from "../campaign";
import prisma from "@/lib/prisma";

// Mock prisma and auth options
vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Campaign Actions - CRUD", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create campaign correctly", async () => {
    const data = {
      name: "Black Friday Roulette",
      slug: "black-friday",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
    };

    const mockCampaign = { id: "camp_1", ...data, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: null,
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should create campaign correctly with background image", async () => {
    const data = {
      name: "Black Friday Roulette",
      slug: "black-friday",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
      backgroundImage: "https://example.com/bg.jpg",
    };

    const mockCampaign = { id: "camp_1", ...data, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: "https://example.com/bg.jpg",
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should fetch all campaigns", async () => {
    const mockCampaigns = [
      { id: "1", name: "C1", slug: "c1", primaryColor: "#1", secondaryColor: "#2" },
    ];
    (prisma.campaign.findMany as any).mockResolvedValue(mockCampaigns);

    const result = await getCampaigns();

    expect(prisma.campaign.findMany).toHaveBeenCalled();
    expect(result).toEqual(mockCampaigns);
  });

  it("should fetch campaign by slug", async () => {
    const mockCampaign = { id: "1", name: "C1", slug: "c-slug", primaryColor: "#1", secondaryColor: "#2" };
    (prisma.campaign.findUnique as any).mockResolvedValue(mockCampaign);

    const result = await getCampaignBySlug("c-slug");

    expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
      where: { slug: "c-slug" },
      include: {
        prizes: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
    expect(result).toEqual(mockCampaign);
  });
});
