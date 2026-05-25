import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import LeadForm from "../LeadForm";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "@/lib/i18n";

// Mock React's useEffect to run synchronously during server-side static rendering tests
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useEffect: (fn: any) => fn(),
  };
});

const mockSetValue = vi.fn();

// Mock react-hook-form
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: (name: string) => ({ name }),
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault();
      fn({ email: "test@example.com", name: "John", phone: "123", consent: true, campaign: "test-campaign" });
    },
    setValue: mockSetValue,
    formState: { errors: {} },
  }),
}));

// Mock createLead action
vi.mock("@/app/actions/lead", () => ({
  createLead: vi.fn().mockResolvedValue({ leadId: "lead_123" }),
}));

describe("LeadForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should accept campaignSlug prop and set the campaign form value on mount", () => {
    const handleSuccess = vi.fn();
    
    // Render LeadForm with campaignSlug
    const element = <LeadForm campaignSlug="test-campaign" onSuccess={handleSuccess} />;
    renderToStaticMarkup(element);

    // Expect the setValue hook was called during mount/effect with correct arguments
    expect(mockSetValue).toHaveBeenCalledWith("campaign", "test-campaign");
  });

  it("should render translations correctly based on active locale", () => {
    const handleSuccess = vi.fn();
    const markupDefault = renderToStaticMarkup(
      <LanguageProvider>
        <LeadForm campaignSlug="test-campaign" onSuccess={handleSuccess} />
      </LanguageProvider>
    );

    // pt-pt is default
    expect(markupDefault).toContain("Pronto para girar?");
    expect(markupDefault).toContain("E-mail *");
    expect(markupDefault).toContain("Nome (Opcional)");
  });
});
