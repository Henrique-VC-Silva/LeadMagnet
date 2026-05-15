import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users, Gift, Settings, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const leadsCount = await prisma.lead.count();
  const prizesCount = await prisma.prize.count();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Total Leads</h2>
          </div>
          <p className="text-3xl font-bold">{leadsCount}</p>
          <Link href="/admin/leads" className="mt-4 text-sm text-primary flex items-center gap-1 hover:underline">
            View all leads <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Gift className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Prizes</h2>
          </div>
          <p className="text-3xl font-bold">{prizesCount}</p>
          <Link href="/admin/prizes" className="mt-4 text-sm text-primary flex items-center gap-1 hover:underline">
            Manage prizes <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Configuration</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Manage retention policy and theme settings.</p>
          <Link href="/admin/settings" className="text-sm text-primary flex items-center gap-1 hover:underline">
            Open settings <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
