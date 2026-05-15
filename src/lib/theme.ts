import { ThemeConfig } from "@/app/actions/settings";

/**
 * Converts a ThemeConfig object into a string of CSS variable definitions.
 * These are injected into the :root selector to provide dynamic styling.
 */
export function generateThemeStyles(config: ThemeConfig): string {
  return `
    :root {
      --primary: ${config.primary_color};
      --secondary: ${config.secondary_color};
      --font-sans: ${config.font_family};
    }
  `.trim();
}
