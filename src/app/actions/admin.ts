"use server";

import prisma from "@/lib/prisma";
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
  return await prisma.lead.findMany({
    include: { wonPrize: true },
    orderBy: { createdAt: "desc" },
  });
}
