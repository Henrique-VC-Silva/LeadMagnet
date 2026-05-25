import { describe, it, expect, vi } from "vitest";
import React from "react";
import Roulette from "../Roulette";
import { Prize } from "@/lib/mongoose";

// Mock React hooks to execute synchronously without React dispatcher
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useState: (val: any) => [val, vi.fn()],
    useEffect: vi.fn(),
    useMemo: (fn: any) => fn(),
  };
});

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    locale: "pt-pt",
    setLocale: vi.fn(),
    t: (key: string) => key,
  }),
}));

// Mock framer-motion to avoid DOM animations during tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement("div", props, children),
  },
  useAnimation: () => ({
    start: vi.fn(),
  }),
  AnimatePresence: ({ children }: any) => children,
}));

const dummyPrizes: Prize[] = [
  { id: "1", name: "Prize A", weight: 1, stock: 10, isNoPrize: false, createdAt: new Date(), updatedAt: new Date() },
  { id: "2", name: "Prize B", weight: 1, stock: 10, isNoPrize: false, createdAt: new Date(), updatedAt: new Date() },
  { id: "3", name: "No Prize", weight: 1, stock: 0, isNoPrize: true, createdAt: new Date(), updatedAt: new Date() },
];

describe("Roulette - Dynamic Colors", () => {
  it("should render SVG sectors alternating dynamic theme fills and grey for no-prize", () => {
    // Call the function directly
    const result = Roulette({
      prizes: dummyPrizes,
      winningPrize: dummyPrizes[0],
      onFinish: vi.fn(),
    });

    // Check raw object representation
    const json = JSON.stringify(result);

    // Expect paths to alternate with CSS theme variables
    expect(json).toContain("var(--primary)");
    expect(json).toContain("var(--secondary)");
    
    // Expect no-prize elements to use a neutral gray background
    expect(json).toContain("#e2e8f0");
  });
});
