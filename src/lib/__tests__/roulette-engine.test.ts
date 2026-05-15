import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouletteEngine } from "../roulette-engine";
import prisma from "../prisma";

// Mock the prisma singleton
vi.mock("../prisma", () => ({
  default: {
    $transaction: vi.fn((callback) => callback(vi.fn())),
    lead: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    prize: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("RouletteEngine", () => {
  const mockLeadId = "lead_123";
  const mockLead = { id: mockLeadId, email: "test@example.com" };

  const mockPrizes = [
    { id: "1", name: "Big Prize", weight: 1, stock: 10, isNoPrize: false },
    { id: "2", name: "Small Prize", weight: 9, stock: 100, isNoPrize: false },
    { id: "3", name: "No Prize", weight: 10, stock: 0, isNoPrize: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should select a prize based on weights", async () => {
    // Mock lead existence
    (prisma.lead.findUnique as any).mockResolvedValue(mockLead);
    
    // Mock eligible prizes
    (prisma.prize.findMany as any).mockResolvedValue(mockPrizes);

    // Mock transaction behavior
    (prisma.$transaction as any).mockImplementation(async (cb) => {
      return cb(prisma);
    });

    // Run multiple spins to verify distribution (conceptually)
    // Here we just test a single run and check mocks
    const result = await RouletteEngine.spin(mockLeadId);

    expect(result.success).toBe(true);
    expect(result.prize).toBeDefined();
    expect(prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: mockLeadId },
        data: expect.objectContaining({ wonPrizeId: result.prize.id }),
      })
    );
  });

  it("should decrement stock for winning prizes", async () => {
    (prisma.lead.findUnique as any).mockResolvedValue(mockLead);
    
    // Only one winning prize
    const winningPrize = mockPrizes[0];
    (prisma.prize.findMany as any).mockResolvedValue([winningPrize]);
    
    (prisma.$transaction as any).mockImplementation(async (cb) => {
      return cb(prisma);
    });

    await RouletteEngine.spin(mockLeadId);

    expect(prisma.prize.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: winningPrize.id },
        data: { stock: { decrement: 1 } },
      })
    );
  });

  it("should NOT decrement stock for No Prize segments", async () => {
    (prisma.lead.findUnique as any).mockResolvedValue(mockLead);
    
    // Only No Prize
    const noPrize = mockPrizes[2];
    (prisma.prize.findMany as any).mockResolvedValue([noPrize]);
    
    (prisma.$transaction as any).mockImplementation(async (cb) => {
      return cb(prisma);
    });

    await RouletteEngine.spin(mockLeadId);

    expect(prisma.prize.update).not.toHaveBeenCalled();
  });

  it("should throw error if no prizes are available", async () => {
    (prisma.lead.findUnique as any).mockResolvedValue(mockLead);
    (prisma.prize.findMany as any).mockResolvedValue([]);
    
    (prisma.$transaction as any).mockImplementation(async (cb) => {
      return cb(prisma);
    });

    await expect(RouletteEngine.spin(mockLeadId)).rejects.toThrow("No prizes available");
  });
});
