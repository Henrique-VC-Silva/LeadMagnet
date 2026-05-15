"use client";

import { useState } from "react";
import { saveSettings } from "@/app/actions/settings";
import { Loader2, ShieldCheck, Palette, Save } from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, string>;
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await saveSettings(settings);
      setMessage({ type: "success", text: "Settings saved successfully!" });
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-6 space-y-8">
        {/* GDPR Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="font-bold">GDPR & Data Retention</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lead Retention (Days)</label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings["retention_days"] || "90"}
                onChange={(e) => setSettings({ ...settings, retention_days: e.target.value })}
                className="w-full max-w-xs px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leads older than this will be automatically deleted by the system.
              </p>
            </div>
          </div>
        </section>

        {/* Branding Section */}
        <section className="pt-8 border-t border-border">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Palette className="h-5 w-5" />
            <h3 className="font-bold">Branding & Theme</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color (Accent)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings["theme_primary_color"] || "#c5a059"}
                  onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                  className="h-10 w-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings["theme_primary_color"] || "#c5a059"}
                  onChange={(e) => setSettings({ ...settings, theme_primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color (Backgrounds)</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings["theme_secondary_color"] || "#f1f1f1"}
                  onChange={(e) => setSettings({ ...settings, theme_secondary_color: e.target.value })}
                  className="h-10 w-10 border border-border rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings["theme_secondary_color"] || "#f1f1f1"}
                  onChange={(e) => setSettings({ ...settings, theme_secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Font Family</label>
              <select
                value={settings["theme_font_family"] || "system-ui"}
                onChange={(e) => setSettings({ ...settings, theme_font_family: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="system-ui">System Default (Sans)</option>
                <option value="'Inter', sans-serif">Inter (Modern)</option>
                <option value="'Playfair Display', serif">Playfair Display (Premium Serif)</option>
                <option value="'Roboto', sans-serif">Roboto</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <footer className="p-6 bg-secondary/20 border-t border-border flex items-center justify-between">
        {message && (
          <p className={`text-sm font-medium ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {message.text}
          </p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="ml-auto flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Configuration
        </button>
      </footer>
    </form>
  );
}
