"use client";

import { useState } from "react";
import { createCampaign } from "@/app/actions/campaign";
import { Loader2, X } from "lucide-react";
import { Campaign } from "@prisma/client";

interface CreateCampaignFormProps {
  onSuccess: (campaign: Campaign) => void;
  onCancel: () => void;
}

export default function CreateCampaignForm({ onSuccess, onCancel }: CreateCampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    primaryColor: "#10b981",
    secondaryColor: "#1e293b",
  });

  const handleNameChange = (name: string) => {
    // Automatically slugify name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData({ ...formData, name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createCampaign(formData);
      onSuccess(result as Campaign);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Error creating campaign (slug may already exist)");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
          <h2 className="text-xl font-bold">Create New Campaign</h2>
          <button onClick={onCancel} className="p-1 hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-black"
              placeholder="e.g. Summer Promo 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Campaign Slug (URL Path)</label>
            <div className="flex rounded-lg overflow-hidden border border-border focus-within:ring-2 focus-within:ring-primary/50">
              <span className="bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground border-r border-border">/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-2 outline-none text-black"
                placeholder="summer-promo-2026"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-2 py-1.5 border border-border rounded text-xs outline-none text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Secondary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full px-2 py-1.5 border border-border rounded text-xs outline-none text-black"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-border font-semibold rounded-lg hover:bg-secondary transition-colors text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
