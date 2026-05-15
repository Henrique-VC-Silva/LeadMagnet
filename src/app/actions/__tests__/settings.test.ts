import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth FIRST
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

import { saveSettings } from "../settings";
import prisma from "@/lib/prisma";

// Mock prisma and auth options
vi.mock("@/lib/prisma", () => ({
  default: {
    setting: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("../api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Settings Actions - Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should persist theme_primary_color correctly", async () => {
    const settingsToSave = {
      theme_primary_color: "#ff0000",
    };

    await saveSettings(settingsToSave);

    expect(prisma.setting.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { key: "theme_primary_color" },
        update: { value: "#ff0000" },
        create: { key: "theme_primary_color", value: "#ff0000" },
      })
    );
  });
});

import { getThemeSettings } from "../settings";
import { DEFAULT_THEME } from "../../../lib/theme";

describe("Settings Actions - Theme Retrieval", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default theme values when database is empty", async () => {
    // Mock database returning empty array
    (prisma.setting.findMany as any).mockResolvedValue([]);

    const theme = await getThemeSettings();

    expect(theme.primary_color).toBe(DEFAULT_THEME.primary_color); 
    expect(theme.font_family).toBe(DEFAULT_THEME.font_family); 
  });

  it("should return database values when they exist", async () => {
    // Mock database returning values
    (prisma.setting.findMany as any).mockResolvedValue([
      { key: "theme_primary_color", value: "#00ff00" },
      { key: "theme_font_family", value: "serif" },
    ]);

    const theme = await getThemeSettings();

    expect(theme.primary_color).toBe("#00ff00");
    expect(theme.font_family).toBe("serif");
  });
});
