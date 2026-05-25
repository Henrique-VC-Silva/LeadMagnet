"use client";

import { useI18n, Locale } from "@/lib/i18n";
import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";

export function LanguageSelector({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const languages: { code: Locale; label: string; flag: string }[] = [
    { code: "pt-pt", label: "Português", flag: "PT" },
    { code: "en", label: "English", flag: "EN" },
    { code: "es", label: "Español", flag: "ES" },
    { code: "fr", label: "Français", flag: "FR" },
  ];

  const currentLang = languages.find((l) => l.code === locale) || languages[0];

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm text-sm font-semibold hover:bg-white/90 transition-all select-none cursor-pointer"
        type="button"
        id="language-selector-button"
      >
        <Globe className="h-4 w-4 text-primary" />
        <span>{currentLang.flag}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* Overlay to close the selector when clicking outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 mt-2 w-40 rounded-xl bg-white/95 dark:bg-black/90 backdrop-blur-xl border border-white/20 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLocale(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors hover:bg-primary/10 hover:text-primary cursor-pointer ${
                  locale === lang.code ? "bg-primary/5 text-primary" : "text-foreground"
                }`}
                type="button"
              >
                <span>{lang.label}</span>
                <span className="text-[10px] text-muted-foreground/60">{lang.flag}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
