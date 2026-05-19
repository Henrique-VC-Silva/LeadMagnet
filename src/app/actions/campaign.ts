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

export async function createCampaign(data: {
  name: string;
  slug: string;
  primaryColor?: string;
  secondaryColor?: string;
}) {
  await ensureAdmin();
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      slug: data.slug,
      primaryColor: data.primaryColor ?? "#c5a059",
      secondaryColor: data.secondaryColor ?? "#f1f1f1",
    },
  });
  revalidatePath("/admin");
  return campaign;
}

export async function getCampaigns() {
  await ensureAdmin();
  return await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function getCampaignBySlug(slug: string) {
  return await prisma.campaign.findUnique({
    where: { slug },
    include: {
      prizes: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
