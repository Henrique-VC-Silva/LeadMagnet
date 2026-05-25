import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth FIRST
vi.mock("next-auth", () => ({
  default: vi.fn(),
  getServerSession: vi.fn(() => Promise.resolve({ user: { name: "Admin", role: "ADMIN" } })),
}));

// Mock mongoose Setting model
vi.mock("@/lib/mongoose", () => {
  return {
    Setting: {
      findOneAndUpdate: vi.fn(),
      find: vi.fn(),
    },
  };
});

import { saveSettings, getThemeSettings } from "../settings";
import { Setting } from "@/lib/mongoose";
import { DEFAULT_THEME } from "../../../lib/theme";

vi.mock("../api/auth/[...nextauth]/route", () => ({
  authOptions: {},
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Settings Actions - Mongoose Persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should persist theme_primary_color correctly using Mongoose upsert", async () => {
    const settingsToSave = {
      theme_primary_color: "#ff0000",
    };

    await saveSettings(settingsToSave);

    expect(Setting.findOneAndUpdate).toHaveBeenCalledWith(
      { key: "theme_primary_color" },
      { value: "#ff0000" },
      { upsert: true, returnDocument: 'after' }
    );
  });
});

describe("Settings Actions - Theme Retrieval via Mongoose", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return default theme values when database is empty", async () => {
    (Setting.find as any).mockResolvedValue([]);

    const theme = await getThemeSettings();

    expect(theme.primary_color).toBe(DEFAULT_THEME.primary_color); 
    expect(theme.font_family).toBe(DEFAULT_THEME.font_family); 
  });

  it("should return database values when they exist", async () => {
    (Setting.find as any).mockResolvedValue([
      { key: "theme_primary_color", value: "#00ff00" },
      { key: "theme_font_family", value: "serif" },
    ]);

    const theme = await getThemeSettings();

    expect(theme.primary_color).toBe("#00ff00");
    expect(theme.font_family).toBe("serif");
  });
});
