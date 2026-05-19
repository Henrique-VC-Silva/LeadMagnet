"use client";

import { useState } from "react";
import { Prize } from "@prisma/client";
import { deletePrize } from "@/app/actions/prize";
import PrizeForm from "./PrizeForm";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Database, 
  Dices, 
  Tag, 
  AlertCircle 
} from "lucide-react";

interface PrizeListProps {
  initialPrizes: Prize[];
  campaignId?: string;
}

export default function PrizeList({ initialPrizes, campaignId }: PrizeListProps) {
  const [prizes, setPrizes] = useState<Prize[]>(initialPrizes);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this prize?")) return;
    await deletePrize(id);
    setPrizes(prizes.filter(p => p.id !== id));
  };

  const handleEdit = (prize: Prize) => {
    setEditingPrize(prize);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingPrize(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = (updatedPrize: Prize) => {
    if (editingPrize) {
      setPrizes(prizes.map(p => p.id === updatedPrize.id ? updatedPrize : p));
    } else {
      setPrizes([updatedPrize, ...prizes]);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Add Prize / Segment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prizes.map((prize) => (
          <div 
            key={prize.id} 
            className="p-6 bg-white border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  prize.isNoPrize 
                    ? "bg-secondary text-muted-foreground" 
                    : "bg-primary/10 text-primary"
                }`}>
                  {prize.isNoPrize ? "No Prize" : "Winning Prize"}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(prize)} className="p-1 text-muted-foreground hover:text-primary transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(prize.id)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4">{prize.name}</h3>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Dices className="h-4 w-4" />
                  <span>Weight: <strong className="text-foreground">{prize.weight}</strong></span>
                </div>
                {!prize.isNoPrize && (
                  <>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      <span>Stock: <strong className={prize.stock < 5 ? "text-red-500 font-bold" : "text-foreground"}>
                        {prize.stock}
                      </strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>Code: <code className="bg-secondary px-1 rounded text-foreground font-semibold">{prize.code}</code></span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {prize.stock === 0 && !prize.isNoPrize && (
              <div className="mt-4 flex items-center gap-2 text-xs text-red-500 font-medium bg-red-50 p-2 rounded border border-red-100">
                <AlertCircle className="h-3 w-3" /> Out of stock - will not appear on wheel
              </div>
            )}
          </div>
        ))}
      </div>

      {isFormOpen && (
        <PrizeForm 
          prize={editingPrize} 
          campaignId={campaignId}
          onSuccess={handleFormSuccess} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}
