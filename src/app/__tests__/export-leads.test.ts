import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../api/admin/leads/export/route";
import { getServerSession } from "next-auth";

// Mock next-auth
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

// Mock mongoose
vi.mock("@/lib/mongoose", () => {
  return {
    Lead: {
      find: vi.fn(() => ({
        sort: vi.fn(() => ({
          lean: vi.fn().mockResolvedValue([]),
        })),
      })),
    },
    Campaign: {
      findById: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(null),
      })),
    },
    Prize: {
      findById: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(null),
      })),
    },
  };
});

import { Lead, Campaign, Prize } from "@/lib/mongoose";

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
        wonPrizeId: "p1",
        campaignId: "c1",
        createdAt: new Date("2026-05-20T12:00:00.000Z"),
      },
      {
        email: "johndoe@example.com",
        name: "John Doe",
        phone: null,
        wonPrizeId: null,
        campaignId: null,
        createdAt: new Date("2026-05-20T13:00:00.000Z"),
      },
    ];

    (Lead.find as any).mockReturnValue({
      sort: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(mockLeads),
      })),
    });

    (Prize.findById as any).mockImplementation((id: string) => ({
      lean: vi.fn().mockResolvedValue(id === "p1" ? { name: "10% Off" } : null),
    }));

    (Campaign.findById as any).mockImplementation((id: string) => ({
      lean: vi.fn().mockResolvedValue(id === "c1" ? { name: "Black Friday" } : null),
    }));

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

    const mockCampaign = { _id: "camp_123", slug: "winter-promo", name: "Winter Promo" };
    (Campaign.findById as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockCampaign),
    });

    const mockLeads = [
      {
        email: "filtered@example.com",
        name: "Filtered Lead",
        phone: "999888",
        wonPrizeId: "p_win",
        campaignId: "camp_123",
        createdAt: new Date("2026-05-20T12:00:00.000Z"),
      },
    ];

    (Lead.find as any).mockReturnValue({
      sort: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(mockLeads),
      })),
    });

    (Prize.findById as any).mockImplementation((id: string) => ({
      lean: vi.fn().mockResolvedValue(id === "p_win" ? { name: "Gift Card" } : null),
    }));

    const mockRequest = new Request("http://localhost/api/admin/leads/export?campaignId=camp_123");
    const response = await GET(mockRequest);

    expect(response.status).toBe(200);
    expect(Campaign.findById).toHaveBeenCalledWith("camp_123");
    expect(Lead.find).toHaveBeenCalledWith({ campaignId: "camp_123" });

    expect(response.headers.get("Content-Disposition")).toContain("leads_export_winter-promo.csv");
    const text = await response.text();
    expect(text).toContain("filtered@example.com,Filtered Lead,999888,Gift Card,Winter Promo,");
  });
});
