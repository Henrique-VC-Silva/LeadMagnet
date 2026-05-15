import { describe, it, expect } from "vitest";
import { generateThemeStyles } from "../theme";
import { ThemeConfig } from "@/app/actions/settings";

describe("Theme Utilities - Style Generation", () => {
  it("should generate a valid CSS variable string from config", () => {
    const config: ThemeConfig = {
      primary_color: "#ff0000",
      secondary_color: "#00ff00",
      font_family: "Inter, sans-serif",
    };

    const styles = generateThemeStyles(config);

    expect(styles).toContain("--primary: #ff0000;");
    expect(styles).toContain("--secondary: #00ff00;");
    expect(styles).toContain("--font-sans: Inter, sans-serif;");
  });
});
