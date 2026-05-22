import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../api/admin/leads/export/route";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    lead: {
      findMany: vi.fn(),
    },
    campaign: {
      findUnique: vi.fn(),
    },
  },
}));

describe("API Endpoint - Export Leads to CSV", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 when not authorized as ADMIN", async () => {
    (getServerSession as any).mockResolvedValue(null);

    const response = await GET();
    expect(response.status).toBe(401);

    const json = await response.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("should return CSV response when authorized as ADMIN", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const mockLeads = [
      {
        email: "henrique@example.com",
        name: "Henrique",
        phone: "123456",
        wonPrize: { name: "10% Off" },
        campaign: { name: "Black Friday" },
        createdAt: new Date("2026-05-20T12:00:00.000Z"),
      },
      {
        email: "johndoe@example.com",
        name: "John Doe",
        phone: null,
        wonPrize: null,
        campaign: null,
        createdAt: new Date("2026-05-20T13:00:00.000Z"),
      },
    ];

    (prisma.lead.findMany as any).mockResolvedValue(mockLeads);

    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv");
    expect(response.headers.get("Content-Disposition")).toContain("leads_export.csv");

    const text = await response.text();
    expect(text).toContain("Email,Name,Phone,Won Prize,Campaign,Created At");
    expect(text).toContain("henrique@example.com,Henrique,123456,10% Off,Black Friday,");
    expect(text).toContain("johndoe@example.com,John Doe,-,-,-,");
  });

  it("should filter by campaignId and return custom filename when campaignId is passed", async () => {
    (getServerSession as any).mockResolvedValue({
      user: { name: "Admin", role: "ADMIN" },
    });

    const mockCampaign = { id: "camp_123", slug: "winter-promo" };
    (prisma.campaign.findUnique as any).mockResolvedValue(mockCampaign);

    const mockLeads = [
      {
        email: "filtered@example.com",
        name: "Filtered Lead",
        phone: "999888",
        wonPrize: { name: "Gift Card" },
        campaign: { name: "Winter Promo" },
        createdAt: new Date("2026-05-20T12:00:00.000Z"),
      },
    ];

    (prisma.lead.findMany as any).mockResolvedValue(mockLeads);

    const mockRequest = new Request("http://localhost/api/admin/leads/export?campaignId=camp_123");
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
      where: { id: "camp_123" },
    });
    expect(prisma.lead.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { campaignId: "camp_123" },
    }));

    expect(response.headers.get("Content-Disposition")).toContain("leads_export_winter-promo.csv");
    const text = await response.text();
    expect(text).toContain("filtered@example.com,Filtered Lead,999888,Gift Card,Winter Promo,");
  });
});
