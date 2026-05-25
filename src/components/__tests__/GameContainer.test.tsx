import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import GameContainer from "../GameContainer";
import { renderToStaticMarkup } from "react-dom/server";

// Mock LeadForm to inspect the passed campaignSlug prop
vi.mock("../LeadForm", () => ({
  default: ({ campaignSlug }: any) => (
    <div className="lead-form-mock" data-campaign-slug={campaignSlug}>
      Lead Form
    </div>
  ),
}));

// Mock framer-motion to avoid animation runtime warnings in test environment
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement("div", props, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("GameContainer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept campaignSlug prop and propagate it to LeadForm", () => {
    const prizes: any[] = [];
    
    // We pass campaignSlug as a prop to GameContainer
    const element = (
      <GameContainer 
        campaignSlug="test-campaign-xyz" 
        initialPrizes={prizes} 
      />
    );
    const html = renderToStaticMarkup(element);

    // Expect LeadForm mock to have received the correct campaign-slug
    expect(html).toContain('data-campaign-slug="test-campaign-xyz"');
  });
});
