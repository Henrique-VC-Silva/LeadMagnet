"use client";

import { useState } from "react";
import { Campaign } from "@/lib/mongoose";
import CreateCampaignForm from "./CreateCampaignForm";
import Link from "next/link";
import { Plus, ArrowRight, Settings, Sparkles } from "lucide-react";

interface CampaignListProps {
  initialCampaigns: Campaign[];
}

export default function CampaignList({ initialCampaigns }: CampaignListProps) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCreateSuccess = (newCampaign: Campaign) => {
    setCampaigns([newCampaign, ...campaigns]);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Active Campaigns
          </h2>
          <p className="text-sm text-muted-foreground">Select a campaign to configure its custom prizes and color theme.</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="p-6 bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{campaign.name}</h3>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-xs bg-secondary/80 px-2 py-1 rounded font-mono text-muted-foreground border border-border">
                    /{campaign.slug}
                  </span>
                  {campaign.isActive !== false ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: campaign.primaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded-full border border-border"
                    style={{ backgroundColor: campaign.secondaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">Secondary</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
              <Link
                href={`/${campaign.slug}`}
                target="_blank"
                className="text-xs text-muted-foreground hover:text-primary hover:underline flex items-center gap-1"
              >
                View Live Roulette <ArrowRight className="h-3 w-3" />
              </Link>

              <Link
                href={`/admin/campaigns/${campaign.id}`}
                className="text-sm bg-secondary px-3 py-1.5 rounded-lg font-medium hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1"
              >
                <Settings className="h-3.5 w-3.5" /> Configure
              </Link>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-2xl bg-secondary/10">
            <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-muted-foreground">No campaigns created yet</p>
            <p className="text-xs text-muted-foreground/80 mt-1">Create your first campaign to spin the wheel!</p>
          </div>
        )}
      </div>

      {isFormOpen && (
        <CreateCampaignForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
}
