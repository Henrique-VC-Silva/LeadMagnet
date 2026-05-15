"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getSettings() {
  await ensureAdmin();
  const settings = await prisma.setting.findMany();
  // Return as a simple object for easier handling
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveSettings(data: Record<string, string>) {
  await ensureAdmin();
  
  const operations = Object.entries(data).map(([key, value]) => 
    prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })
  );

  await Promise.all(operations);
  revalidatePath("/admin/settings");
  return { success: true };
}
