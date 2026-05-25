import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Lead, Campaign, Prize } from "@/lib/mongoose";

export async function GET(request?: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let campaignId: string | null = null;
    let filename = "leads_export.csv";

    if (request) {
      const { searchParams } = new URL(request.url);
      campaignId = searchParams.get("campaignId");
    }

    const query: any = {};
    if (campaignId) {
      query.campaignId = campaignId;
      
      const campaign = await Campaign.findById(campaignId).lean() as any;
      if (campaign) {
        filename = `leads_export_${campaign.slug}.csv`;
      }
    }

    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean() as any[];

    // Generate CSV Header
    const headers = ["Email", "Name", "Phone", "Won Prize", "Campaign", "Created At"];
    const csvRows = [headers.join(",")];

    for (const lead of leads) {
      let wonPrizeName = "-";
      let campaignName = "-";

      if (lead.wonPrizeId) {
        const prize = await Prize.findById(lead.wonPrizeId).lean() as any;
        if (prize) wonPrizeName = prize.name;
      }

      if (lead.campaignId) {
        const campaign = await Campaign.findById(lead.campaignId).lean() as any;
        if (campaign) campaignName = campaign.name;
      }

      const email = lead.email || "-";
      const name = lead.name || "-";
      const phone = lead.phone || "-";
      const createdAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : "-";

      // Escape quotes and commas in fields
      const escapedRow = [email, name, phone, wonPrizeName, campaignName, createdAt].map(field => {
        const escaped = field.replace(/"/g, '""');
        return escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')
          ? `"${escaped}"`
          : escaped;
      });

      csvRows.push(escapedRow.join(","));
    }

    const csvContent = csvRows.join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Failed to export leads:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
