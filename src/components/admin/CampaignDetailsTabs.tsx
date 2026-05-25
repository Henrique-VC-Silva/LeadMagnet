"use client";

import { useState } from "react";
import { Campaign, Prize } from "@/lib/mongoose";
import { updateCampaign, deleteCampaign } from "@/app/actions/campaign";
import PrizeList from "./PrizeList";
import { Sparkles, Palette, Gift, Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface CampaignDetailsTabsProps {
  campaign: Campaign & { prizes: Prize[] };
}

export default function CampaignDetailsTabs({ campaign: initialCampaign }: CampaignDetailsTabsProps) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [activeTab, setActiveTab] = useState<"theme" | "prizes">("theme");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [formData, setFormData] = useState({
    name: campaign.name,
    slug: campaign.slug,
    primaryColor: campaign.primaryColor,
    secondaryColor: campaign.secondaryColor,
    backgroundImage: campaign.backgroundImage || "",
    logo: campaign.logo || "",
    copyTitle: campaign.copyTitle || "",
    copySubtitle: campaign.copySubtitle || "",
    copyButton: campaign.copyButton || "",
    isActive: campaign.isActive !== false,
  });
  const router = useRouter();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: fileData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setFormData((prev) => ({ ...prev, backgroundImage: result.url }));
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBackground = () => {
    setFormData((prev) => ({ ...prev, backgroundImage: "" }));
    setUploadError("");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setLogoUploadError("");

    const fileData = new FormData();
    fileData.append("file", file);

    try {
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: fileData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      setFormData((prev) => ({ ...prev, logo: result.url }));
    } catch (error: any) {
      console.error("Logo upload error:", error);
      setLogoUploadError(error.message || "Failed to upload logo. Please try again.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: "" }));
    setLogoUploadError("");
  };

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

  const handleDeleteCampaign = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this campaign? All leads and prizes will be permanently lost."
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteCampaign(campaign.id);
      alert("Campaign deleted successfully.");
      router.push("/admin");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    } finally {
      setIsDeleting(false);
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

      {activeTab === "theme" ? (
        <>
          <form onSubmit={handleSaveTheme} className="bg-white border border-border rounded-xl p-8 space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Visual Identity
          </h2>
          <p className="text-sm text-muted-foreground">Customize title details and color scheme for this campaign roulette wheel.</p>

          <div className="space-y-4 pt-4">
            {/* Campaign Status Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/10 border border-border rounded-xl">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Campaign Active Status</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.isActive 
                    ? "Visible to public at /[slug]" 
                    : "Hidden to public, renders 'Campaign Inactive' screen"}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  formData.isActive ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Campaign Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-white bg-transparent"
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

            <div>
              <label className="block text-sm font-medium mb-1.5">Background Image (Optional)</label>
              
              {isUploading ? (
                <div className="w-full border-2 border-dashed border-border bg-slate-950/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Uploading background image...</span>
                </div>
              ) : formData.backgroundImage ? (
                <div 
                  className="w-full h-24 rounded-xl border border-border shadow-lg bg-cover bg-center flex items-center justify-between px-4 relative overflow-hidden"
                  style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4)), url(${formData.backgroundImage})` }}
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-primary">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Background Image Active</p>
                      <span className="text-[10px] text-slate-400 font-mono select-all block max-w-[200px] truncate">{formData.backgroundImage}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveBackground}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all z-10"
                    title="Remove Background"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full border-2 border-dashed border-border hover:border-primary/50 bg-slate-950/5 hover:bg-slate-950/10 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative group">
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 group-hover:text-primary transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Upload background image</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports WebP, PNG, JPG, SVG (Max 5MB)</p>
                  </div>
                </label>
              )}

              {uploadError && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{uploadError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Campaign Logo (Optional)</label>
              
              {isUploadingLogo ? (
                <div className="w-full border-2 border-dashed border-border bg-slate-950/5 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Uploading campaign logo...</span>
                </div>
              ) : formData.logo ? (
                <div 
                  className="w-full h-24 rounded-xl border border-border shadow-lg bg-slate-950 flex items-center justify-between px-4 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3 z-10">
                    <div className="p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-primary w-16 h-16 flex items-center justify-center overflow-hidden">
                      <img src={formData.logo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Campaign Logo Active</p>
                      <span className="text-[10px] text-slate-400 font-mono select-all block max-w-[200px] truncate">{formData.logo}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 transition-all z-10"
                    title="Remove Logo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="w-full border-2 border-dashed border-border hover:border-primary/50 bg-slate-950/5 hover:bg-slate-950/10 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative group">
                  <input
                    type="file"
                    accept="image/*,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 group-hover:text-primary transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">Upload campaign logo</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Supports WebP, PNG, JPG, SVG (Max 5MB)</p>
                  </div>
                </label>
              )}

              {logoUploadError && (
                <p className="text-xs text-red-500 mt-1.5 font-medium">{logoUploadError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Headline (Optional)</label>
              <input
                type="text"
                value={formData.copyTitle}
                onChange={(e) => setFormData({ ...formData, copyTitle: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-white bg-transparent"
                placeholder="Spin to Win Your Exclusive Prize"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subtitle (Optional)</label>
              <input
                type="text"
                value={formData.copySubtitle}
                onChange={(e) => setFormData({ ...formData, copySubtitle: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-white bg-transparent"
                placeholder="Join our community and try your luck. Everyone wins something!"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Form Button Text (Optional)</label>
              <input
                type="text"
                value={formData.copyButton}
                onChange={(e) => setFormData({ ...formData, copyButton: e.target.value })}
                className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-white bg-transparent"
                placeholder="Continue to Spin"
              />
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

        {/* Danger Zone */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-8 max-w-2xl mt-8 space-y-4">
          <div className="flex items-center gap-2 text-red-500">
            <Trash2 className="h-5 w-5" />
            <h2 className="text-xl font-bold">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Permanently delete this campaign and all associated data, including all leads captured and custom prizes configured. This action is irreversible.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-800/50 text-white font-semibold rounded-lg transition-all flex items-center gap-2 shadow-md shadow-red-950/20"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete Campaign
            </button>
          </div>
        </div>
      </>
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
