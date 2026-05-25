import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Lead, Campaign } from "@/lib/mongoose";
import Link from "next/link";
import { Users, Settings, ArrowRight, FolderKanban } from "lucide-react";
import CampaignList from "@/components/admin/CampaignList";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const leadsCount = await Lead.countDocuments();
  const campaignsCount = await Campaign.countDocuments();
  const campaignsRaw = await Campaign.find().sort({ createdAt: -1 }).lean();
  
  const campaigns = campaignsRaw.map((c: any) => {
    const plain = JSON.parse(JSON.stringify(c));
    return {
      ...plain,
      id: plain._id,
    };
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session?.user?.name}</p>
        </div>
        <Link
          href="/admin/settings"
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-secondary transition-all"
        >
          <Settings className="h-4 w-4" /> Global Settings
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <FolderKanban className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Active Campaigns</h2>
          </div>
          <p className="text-3xl font-bold">{campaignsCount}</p>
          <span className="text-xs text-muted-foreground mt-4 block">
            Each campaign manages its own wheel.
          </span>
        </div>

        <div className="p-6 bg-white border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <h2 className="font-semibold">Global Setup</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">GDPR policy and developer config overrides.</p>
          <Link href="/admin/settings" className="text-sm text-primary flex items-center gap-1 hover:underline">
            Open settings <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="border-t border-border pt-8">
        <CampaignList initialCampaigns={JSON.parse(JSON.stringify(campaigns))} />
      </div>
    </div>
  );
}
