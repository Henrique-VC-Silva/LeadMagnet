import { Campaign, Prize } from "@/lib/mongoose";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import CampaignDetailsTabs from "@/components/admin/CampaignDetailsTabs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface AdminCampaignDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCampaignDetailsPage({ params }: AdminCampaignDetailsProps) {
  // Ensure authenticated Admin
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return notFound();
  }

  const { id } = await params;
  const campaign = await Campaign.findById(id).lean() as any;

  if (!campaign) {
    notFound();
  }

  campaign.id = campaign._id.toString();
  const prizes = await Prize.find({ campaignId: campaign.id }).sort({ createdAt: 1 }).lean();
  campaign.prizes = prizes.map((p: any) => ({ ...p, id: p._id.toString() }));

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <Link href="/admin" className="text-sm text-primary flex items-center gap-1 mb-2 hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            {campaign.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Configure prizes, customize color themes, and view campaign statistics.</p>
        </div>

        <Link
          href={`/${campaign.slug}`}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-lg text-primary font-medium hover:bg-primary/10 transition-all self-start md:self-auto"
        >
          View Wheel Live <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      <CampaignDetailsTabs campaign={campaign} />
    </div>
  );
}
