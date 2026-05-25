import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLead } from "../lead";

// Mock Mongoose models
vi.mock("@/lib/mongoose", () => {
  return {
    Campaign: {
      findOne: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(null),
      })),
    },
    Lead: {
      create: vi.fn(),
    },
  };
});

import { Campaign, Lead } from "@/lib/mongoose";

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
    (Campaign.findOne as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: "camp_black_friday",
        name: "Black Friday",
        slug: "black-friday",
      }),
    });

    (Lead.create as any).mockResolvedValue({
      _id: "lead_123",
      email: "test@example.com",
    });

    const result = await createLead(input);

    expect(Campaign.findOne).toHaveBeenCalledWith({ slug: "black-friday" });

    expect(Lead.create).toHaveBeenCalledWith({
      email: "test@example.com",
      name: "John Doe",
      phone: "123456",
      campaignId: "camp_black_friday",
      consent: true,
      consentAt: expect.any(Date),
    });

    expect(result).toEqual({ success: true, leadId: "lead_123" });
  });
});
