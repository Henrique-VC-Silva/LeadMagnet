import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      include: {
        wonPrize: true,
        campaign: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV Header
    const headers = ["Email", "Name", "Phone", "Won Prize", "Campaign", "Created At"];
    const csvRows = [headers.join(",")];

    for (const lead of leads) {
      const email = lead.email || "-";
      const name = lead.name || "-";
      const phone = lead.phone || "-";
      const wonPrize = lead.wonPrize?.name || "-";
      const campaign = lead.campaign?.name || "-";
      const createdAt = lead.createdAt ? new Date(lead.createdAt).toISOString() : "-";

      // Escape quotes and commas in fields
      const escapedRow = [email, name, phone, wonPrize, campaign, createdAt].map(field => {
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
        "Content-Disposition": 'attachment; filename="leads_export.csv"',
      },
    });
  } catch (error) {
    console.error("Failed to export leads:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
