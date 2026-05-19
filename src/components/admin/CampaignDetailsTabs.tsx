"use client";

import { useState } from "react";
import { Campaign, Prize } from "@prisma/client";
import { updateCampaign } from "@/app/actions/campaign";
import PrizeList from "./PrizeList";
import { Sparkles, Palette, Gift, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface CampaignDetailsTabsProps {
  campaign: Campaign & { prizes: Prize[] };
}

export default function CampaignDetailsTabs({ campaign: initialCampaign }: CampaignDetailsTabsProps) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [activeTab, setActiveTab] = useState<"theme" | "prizes">("theme");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: campaign.name,
    slug: campaign.slug,
    primaryColor: campaign.primaryColor,
    secondaryColor: campaign.secondaryColor,
  });
  const router = useRouter();

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updated = await updateCampaign(campaign.id, formData);
      setCampaign({ ...campaign, ...updated });
      alert("Campaign configuration updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Failed to update campaign:", error);
      alert("Error saving configuration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-border gap-6">
        <button
          onClick={() => setActiveTab("theme")}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "theme"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="h-4 w-4" /> Theme & Identity
        </button>
        <button
          onClick={() => setActiveTab("prizes")}
          className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "prizes"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Gift className="h-4 w-4" /> Campaign Prizes
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "theme" ? (
        <form onSubmit={handleSaveTheme} className="bg-white border border-border rounded-xl p-8 space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Visual Identity
          </h2>
          <p className="text-sm text-muted-foreground">Customize title details and color scheme for this campaign roulette wheel.</p>

          <div className="space-y-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Campaign Slug</label>
              <div className="flex rounded-lg overflow-hidden border border-border focus-within:ring-2 focus-within:ring-primary/50">
                <span className="bg-secondary/40 px-3 flex items-center text-sm text-muted-foreground border-r border-border">/</span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="flex-1 px-4 py-2 outline-none text-white bg-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div>
                <label className="block text-sm font-medium mb-2">Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none text-white bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Secondary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-12 h-12 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm outline-none text-white bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Theme Config
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white border border-border rounded-xl p-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary" /> Prizes Wheel segments
              </h2>
              <p className="text-sm text-muted-foreground">Manage segments for this wheel. Keep exactly 8 slices for best look.</p>
            </div>
          </div>
          <PrizeList initialPrizes={campaign.prizes} campaignId={campaign.id} />
        </div>
      )}
    </div>
  );
}
