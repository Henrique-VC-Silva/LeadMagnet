import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth FIRST
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

import { createCampaign, getCampaigns, getCampaignBySlug, updateCampaign, deleteCampaign } from "../campaign";
import prisma from "@/lib/prisma";

// Mock prisma and auth options
vi.mock("@/lib/prisma", () => {
  const mockPrisma = {
    campaign: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    lead: {
      deleteMany: vi.fn(),
    },
    prize: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn((arg) => {
      if (typeof arg === "function") {
        return arg(mockPrisma);
      }
      return Promise.resolve(arg);
    }),
  };
  return { default: mockPrisma };
});

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

    const mockCampaign = { id: "camp_1", ...data, logo: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: null,
        logo: null,
        copyTitle: null,
        copySubtitle: null,
        copyButton: null,
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

    const mockCampaign = { id: "camp_1", ...data, logo: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: "https://example.com/bg.jpg",
        logo: null,
        copyTitle: null,
        copySubtitle: null,
        copyButton: null,
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should create campaign correctly with custom copy fields", async () => {
    const data = {
      name: "Black Friday Roulette",
      slug: "black-friday",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
      copyTitle: "Special Win!",
      copySubtitle: "Spin to win big discounts",
      copyButton: "Let's Go!",
    };

    const mockCampaign = { id: "camp_1", ...data, backgroundImage: null, logo: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Black Friday Roulette",
        slug: "black-friday",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: null,
        logo: null,
        copyTitle: "Special Win!",
        copySubtitle: "Spin to win big discounts",
        copyButton: "Let's Go!",
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should create campaign correctly with logo image", async () => {
    const data = {
      name: "Logo Campaign",
      slug: "logo-campaign",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
      logo: "/uploads/logo.png",
    };

    const mockCampaign = { id: "camp_1", ...data, backgroundImage: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Logo Campaign",
        slug: "logo-campaign",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: null,
        logo: "/uploads/logo.png",
        copyTitle: null,
        copySubtitle: null,
        copyButton: null,
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should update campaign correctly with logo image", async () => {
    const data = {
      name: "Updated Campaign",
      slug: "updated-campaign",
      primaryColor: "#0000ff",
      secondaryColor: "#ffffff",
      backgroundImage: "/uploads/bg.png",
      logo: "/uploads/new-logo.png",
      copyTitle: "Updated Title",
      copySubtitle: "Updated Subtitle",
      copyButton: "Updated Button",
    };

    const mockCampaign = { id: "camp_1", ...data, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.update as any).mockResolvedValue(mockCampaign);

    const result = await updateCampaign("camp_1", data);

    expect(prisma.campaign.update).toHaveBeenCalledWith({
      where: { id: "camp_1" },
      data: {
        name: "Updated Campaign",
        slug: "updated-campaign",
        primaryColor: "#0000ff",
        secondaryColor: "#ffffff",
        backgroundImage: "/uploads/bg.png",
        logo: "/uploads/new-logo.png",
        copyTitle: "Updated Title",
        copySubtitle: "Updated Subtitle",
        copyButton: "Updated Button",
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

  it("should create campaign correctly with isActive set", async () => {
    const data = {
      name: "Inactive Campaign",
      slug: "inactive",
      primaryColor: "#ff0000",
      secondaryColor: "#000000",
      isActive: false,
    };

    const mockCampaign = { id: "camp_1", ...data, logo: null, backgroundImage: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.create as any).mockResolvedValue(mockCampaign);

    const result = await createCampaign(data);

    expect(prisma.campaign.create).toHaveBeenCalledWith({
      data: {
        name: "Inactive Campaign",
        slug: "inactive",
        primaryColor: "#ff0000",
        secondaryColor: "#000000",
        backgroundImage: null,
        logo: null,
        copyTitle: null,
        copySubtitle: null,
        copyButton: null,
        isActive: false,
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should update campaign correctly including isActive flag", async () => {
    const data = {
      name: "Updated Campaign",
      slug: "updated-campaign",
      primaryColor: "#0000ff",
      secondaryColor: "#ffffff",
      isActive: false,
    };

    const mockCampaign = { id: "camp_1", ...data, logo: null, backgroundImage: null, createdAt: new Date(), updatedAt: new Date() };
    (prisma.campaign.update as any).mockResolvedValue(mockCampaign);

    const result = await updateCampaign("camp_1", data);

    expect(prisma.campaign.update).toHaveBeenCalledWith({
      where: { id: "camp_1" },
      data: {
        name: "Updated Campaign",
        slug: "updated-campaign",
        primaryColor: "#0000ff",
        secondaryColor: "#ffffff",
        backgroundImage: null,
        logo: null,
        copyTitle: null,
        copySubtitle: null,
        copyButton: null,
        isActive: false,
      },
    });
    expect(result).toEqual(mockCampaign);
  });

  it("should delete campaign and its relations correctly in a transaction", async () => {
    const mockCampaign = { id: "camp_1", name: "To Delete", slug: "to-delete" };
    (prisma.campaign.delete as any).mockResolvedValue(mockCampaign);

    const result = await deleteCampaign("camp_1");

    expect(prisma.lead.deleteMany).toHaveBeenCalledWith({
      where: { campaignId: "camp_1" },
    });
    expect(prisma.prize.deleteMany).toHaveBeenCalledWith({
      where: { campaignId: "camp_1" },
    });
    expect(prisma.campaign.delete).toHaveBeenCalledWith({
      where: { id: "camp_1" },
    });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(result).toEqual(mockCampaign);
  });
});
