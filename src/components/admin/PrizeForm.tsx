"use client";

import { useState } from "react";
import { Prize } from "@prisma/client";
import { createPrize, updatePrize } from "@/app/actions/prize";
import { Loader2, X } from "lucide-react";

interface PrizeFormProps {
  prize: Prize | null;
  campaignId?: string;
  onSuccess: (prize: Prize) => void;
  onCancel: () => void;
}

export default function PrizeForm({ prize, campaignId, onSuccess, onCancel }: PrizeFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: prize?.name || "",
    weight: prize?.weight || 1,
    stock: prize?.stock || 0,
    code: prize?.code || "",
    isNoPrize: prize?.isNoPrize || false,
    campaignId: prize?.campaignId || campaignId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let result;
      if (prize) {
        result = await updatePrize(prize.id, formData);
      } else {
        result = await createPrize(formData);
      }
      onSuccess(result as Prize);
    } catch (error) {
      console.error("Failed to save prize:", error);
      alert("Error saving prize");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
          <h2 className="text-xl font-bold">{prize ? "Edit Prize" : "Add New Prize"}</h2>
          <button onClick={onCancel} className="p-1 hover:bg-secondary rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-6 p-3 bg-secondary/50 rounded-lg">
            <input
              type="checkbox"
              id="isNoPrize"
              checked={formData.isNoPrize}
              onChange={(e) => setFormData({ ...formData, isNoPrize: e.target.checked })}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="isNoPrize" className="text-sm font-medium">This is a "No Prize" / "Try Again" segment</label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g. 10% Off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weight (Relative Probability)</label>
            <input
              type="number"
              required
              min="1"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[10px] text-muted-foreground mt-1">Higher numbers = higher win frequency</p>
          </div>

          {!formData.isNoPrize && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Stock</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prize Code (Generic)</label>
                <input
                  type="text"
                  required={!formData.isNoPrize}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g. SAVE10"
                />
              </div>
            </>
          )}

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 border border-border font-semibold rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {prize ? "Save Changes" : "Create Prize"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
