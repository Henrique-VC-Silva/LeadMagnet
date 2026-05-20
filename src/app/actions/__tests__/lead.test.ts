import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLead } from "../lead";
import prisma from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", () => ({
  default: {
    campaign: {
      findUnique: vi.fn(),
    },
    lead: {
      create: vi.fn(),
    },
  },
}));

describe("Lead Action - createLead", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should lookup campaign slug and save campaignId to lead", async () => {
    const input = {
      email: "test@example.com",
      name: "John Doe",
      phone: "123456",
      campaign: "black-friday",
      consent: true,
    };

    // Mock campaign slug lookup
    (prisma.campaign.findUnique as any).mockResolvedValue({
      id: "camp_black_friday",
      name: "Black Friday",
      slug: "black-friday",
    });

    (prisma.lead.create as any).mockResolvedValue({ id: "lead_123" });

    const result = await createLead(input);

    expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
      where: { slug: "black-friday" },
    });

    expect(prisma.lead.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        name: "John Doe",
        phone: "123456",
        campaignId: "camp_black_friday",
        consent: true,
        consentAt: expect.any(Date),
      },
    });

    expect(result).toEqual({ success: true, leadId: "lead_123" });
  });
});
