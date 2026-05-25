import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useI18n, LanguageProvider } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";

function TestComponent() {
  const { locale, t } = useI18n();
  return (
    <div>
      <span id="locale">{locale}</span>
      <span id="text">{t("readyToSpin")}</span>
    </div>
  );
}

describe("i18n Support", () => {
  it("should default to pt-pt and translate text", () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    expect(markup).toContain("pt-pt");
    expect(markup).toContain("Pronto para girar?");
  });

  it("should render language choices in LanguageSelector", () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <LanguageSelector defaultOpen={true} />
      </LanguageProvider>
    );

    // Verify it contains the language options or representations
    expect(markup).toContain("PT");
    expect(markup).toContain("EN");
    expect(markup).toContain("ES");
    expect(markup).toContain("FR");
  });
});
