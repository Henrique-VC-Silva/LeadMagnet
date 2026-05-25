import { describe, it, expect, beforeEach } from "vitest";
import { Campaign } from "@/lib/mongoose";

describe("Campaign - defaultLanguage field", () => {
  it("should default to pt-pt when no language is specified", async () => {
    const campaign = new Campaign({
      name: "Default Lang Campaign",
      slug: "default-lang-test",
    });

    expect(campaign.defaultLanguage).toBe("pt-pt");
  });

  it("should accept valid language options and restrict to enum", async () => {
    const campaign = new Campaign({
      name: "English Base Campaign",
      slug: "english-base-test",
      defaultLanguage: "en",
    });

    expect(campaign.defaultLanguage).toBe("en");
  });
});
