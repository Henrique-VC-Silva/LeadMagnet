/**
 * Theme configuration and utilities
 */

export type ThemeConfig = {
  primary_color: string;
  secondary_color: string;
  font_family: string;
};

export const DEFAULT_THEME: ThemeConfig = {
  primary_color: "#ff6b6b", // BusinessKids Red/Pink
  secondary_color: "#4ecdc4", // BusinessKids Teal
  font_family: "'Outfit', system-ui, sans-serif", // Playful modern font
};

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
