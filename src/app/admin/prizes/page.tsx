import { getPrizes } from "@/app/actions/prize";
import PrizeList from "@/components/admin/PrizeList";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";

export default async function AdminPrizesPage() {
  const prizes = await getPrizes();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="h-3 w-3" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Manage Prizes</h1>
        </div>
        
        {/* We'll handle the 'Add' modal in the client component */}
      </header>

      <PrizeList initialPrizes={prizes} />
    </div>
  );
}
