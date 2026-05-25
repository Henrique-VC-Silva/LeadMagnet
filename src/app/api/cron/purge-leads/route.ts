import { NextResponse } from "next/server";
import { Lead, Setting } from "@/lib/mongoose";

export async function GET(req: Request) {
  // Simple auth via header to prevent public access
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get retention policy from settings
    const retentionSetting = await Setting.findOne({ key: "retention_days" }).lean() as any;

    const days = retentionSetting ? parseInt(retentionSetting.value) : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const deleted = await Lead.deleteMany({
      createdAt: { $lt: cutoff },
    });

    return NextResponse.json({
      success: true,
      deletedCount: deleted.deletedCount,
      retentionDays: days,
    });
  } catch (error) {
    console.error("Purge leads failed:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
