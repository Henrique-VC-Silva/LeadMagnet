import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouletteEngine } from "../roulette-engine";

// Mock Mongoose
vi.mock("../mongoose", () => {
  return {
    Lead: {
      findById: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue(null),
      })),
      findByIdAndUpdate: vi.fn(),
    },
    Prize: {
      find: vi.fn(() => ({
        lean: vi.fn().mockResolvedValue([]),
      })),
      findByIdAndUpdate: vi.fn(),
    },
  };
});

import { Lead, Prize } from "../mongoose";

describe("RouletteEngine", () => {
  const mockLeadId = "lead_123";
  const mockLead = { _id: mockLeadId, email: "test@example.com" };

  const mockPrizes = [
    { _id: "1", name: "Big Prize", weight: 1, stock: 10, isNoPrize: false },
    { _id: "2", name: "Small Prize", weight: 9, stock: 100, isNoPrize: false },
    { _id: "3", name: "No Prize", weight: 10, stock: 0, isNoPrize: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should select a prize based on weights", async () => {
    // Mock lead existence
    (Lead.findById as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLead),
    });

    // Mock eligible prizes
    (Prize.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockPrizes),
    });

    const result = await RouletteEngine.spin(mockLeadId);

    expect(result.success).toBe(true);
    expect(result.prize).toBeDefined();
    expect(Lead.findByIdAndUpdate).toHaveBeenCalledWith(
      mockLeadId,
      { wonPrizeId: result.prize.id }
    );
  });

  it("should decrement stock for winning prizes", async () => {
    (Lead.findById as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLead),
    });

    // Only one winning prize
    const winningPrize = mockPrizes[0];
    (Prize.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue([winningPrize]),
    });

    await RouletteEngine.spin(mockLeadId);

    expect(Prize.findByIdAndUpdate).toHaveBeenCalledWith(
      "1",
      { $inc: { stock: -1 } }
    );
  });

  it("should NOT decrement stock for No Prize segments", async () => {
    (Lead.findById as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLead),
    });

    // Only No Prize
    const noPrize = mockPrizes[2];
    (Prize.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue([noPrize]),
    });

    await RouletteEngine.spin(mockLeadId);

    expect(Prize.findByIdAndUpdate).not.toHaveBeenCalled();
  });

  it("should throw error if no prizes are available", async () => {
    (Lead.findById as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockLead),
    });
    (Prize.find as any).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    });

    await expect(RouletteEngine.spin(mockLeadId)).rejects.toThrow("No prizes available");
  });
});
