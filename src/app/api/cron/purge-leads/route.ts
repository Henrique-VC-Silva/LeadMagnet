import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  // Simple auth via header to prevent public access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get retention policy from settings
    const retentionSetting = await prisma.setting.findUnique({
      where: { key: "retention_days" },
    });

    const days = retentionSetting ? parseInt(retentionSetting.value) : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const deleted = await prisma.lead.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.count,
      retentionDays: days,
    });
  } catch (error) {
    console.error("Purge leads failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
