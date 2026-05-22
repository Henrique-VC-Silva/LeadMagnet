"use client";

import { useState } from "react";
import { createCampaign } from "@/app/actions/campaign";
import { Loader2, X, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { Campaign } from "@prisma/client";

interface CreateCampaignFormProps {
  onSuccess: (campaign: Campaign) => void;
  onCancel: () => void;
}

export default function CreateCampaignForm({ onSuccess, onCancel }: CreateCampaignFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    primaryColor: "#10b981",
    secondaryColor: "#1e293b",
    backgroundImage: "",
    logo: "",
    copyTitle: "",
    copySubtitle: "",
    copyButton: "",
  });

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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-slate-100">
        <header className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h2 className="text-xl font-bold text-slate-100">Create New Campaign</h2>
          <button onClick={onCancel} className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Campaign Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-slate-100"
              placeholder="e.g. Summer Promo 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Campaign Slug (URL Path)</label>
            <div className="flex rounded-lg overflow-hidden border border-slate-700 focus-within:ring-2 focus-within:ring-primary/50 bg-slate-950">
              <span className="bg-slate-800 px-3 flex items-center text-sm text-slate-400 border-r border-slate-700">/</span>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="flex-1 px-4 py-2 outline-none text-slate-100 bg-transparent"
                placeholder="summer-promo-2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Background Image (Optional)</label>
            
            {isUploading ? (
              <div className="w-full border-2 border-dashed border-slate-700 bg-slate-950/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">Uploading background image...</span>
              </div>
            ) : formData.backgroundImage ? (
              <div 
                className="w-full h-24 rounded-xl border border-slate-800 shadow-lg bg-cover bg-center flex items-center justify-between px-4 relative overflow-hidden"
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
              <label className="w-full border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-950/50 hover:bg-slate-950 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative group">
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
              <p className="text-xs text-red-400 mt-1.5 font-medium">{uploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Campaign Logo (Optional)</label>
            
            {isUploadingLogo ? (
              <div className="w-full border-2 border-dashed border-slate-700 bg-slate-950/30 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">Uploading campaign logo...</span>
              </div>
            ) : formData.logo ? (
              <div 
                className="w-full h-24 rounded-xl border border-slate-800 shadow-lg bg-slate-950 flex items-center justify-between px-4 relative overflow-hidden"
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
              <label className="w-full border-2 border-dashed border-slate-700 hover:border-primary/50 bg-slate-950/50 hover:bg-slate-950 transition-all rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative group">
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
              <p className="text-xs text-red-400 mt-1.5 font-medium">{logoUploadError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Headline (Optional)</label>
            <input
              type="text"
              value={formData.copyTitle}
              onChange={(e) => setFormData({ ...formData, copyTitle: e.target.value })}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-slate-100"
              placeholder="Spin to Win Your Exclusive Prize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Subtitle (Optional)</label>
            <input
              type="text"
              value={formData.copySubtitle}
              onChange={(e) => setFormData({ ...formData, copySubtitle: e.target.value })}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-slate-100"
              placeholder="Join our community and try your luck. Everyone wins something!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Button Text (Optional)</label>
            <input
              type="text"
              value={formData.copyButton}
              onChange={(e) => setFormData({ ...formData, copyButton: e.target.value })}
              className="w-full px-4 py-2 border border-slate-700 bg-slate-950 rounded-lg outline-none focus:ring-2 focus:ring-primary/50 text-slate-100"
              placeholder="Continue to Spin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Primary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-700 bg-slate-950 rounded text-xs outline-none text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Secondary Color</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-10 h-10 rounded border border-slate-700 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-full px-2 py-1.5 border border-slate-700 bg-slate-950 rounded text-xs outline-none text-slate-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-slate-700 font-semibold rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
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
