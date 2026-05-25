"use server";

import { Lead, Prize } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getLeads() {
  await ensureAdmin();
  const leads = await Lead.find().sort({ createdAt: -1 }).lean();
  
  // Populate wonPrize manual fallback to maintain identical return contract
  const populated = await Promise.all(leads.map(async (lead: any) => {
    lead.id = lead._id.toString();
    if (lead.wonPrizeId) {
      const prize = await Prize.findById(lead.wonPrizeId).lean();
      if (prize) {
        lead.wonPrize = { ...prize, id: prize._id.toString() };
      }
    }
    return lead;
  }));

  return populated;
}
