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
  backgroundImage?: string;
  logo?: string;
  copyTitle?: string;
  copySubtitle?: string;
  copyButton?: string;
  isActive?: boolean;
}) {
  await ensureAdmin();
  const campaign = await prisma.campaign.create({
    data: {
      name: data.name,
      slug: data.slug,
      primaryColor: data.primaryColor ?? "#c5a059",
      secondaryColor: data.secondaryColor ?? "#f1f1f1",
      backgroundImage: data.backgroundImage || null,
      logo: data.logo || null,
      copyTitle: data.copyTitle || null,
      copySubtitle: data.copySubtitle || null,
      copyButton: data.copyButton || null,
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
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

export async function updateCampaign(
  id: string,
  data: {
    name: string;
    slug: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundImage?: string;
    logo?: string;
    copyTitle?: string;
    copySubtitle?: string;
    copyButton?: string;
    isActive?: boolean;
  }
) {
  await ensureAdmin();
  const campaign = await prisma.campaign.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      backgroundImage: data.backgroundImage || null,
      logo: data.logo || null,
      copyTitle: data.copyTitle || null,
      copySubtitle: data.copySubtitle || null,
      copyButton: data.copyButton || null,
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
    },
  });
  revalidatePath("/admin");
  return campaign;
}

export async function deleteCampaign(id: string) {
  await ensureAdmin();
  const deletedCampaign = await prisma.$transaction(async (tx) => {
    await tx.lead.deleteMany({
      where: { campaignId: id },
    });
    await tx.prize.deleteMany({
      where: { campaignId: id },
    });
    return await tx.campaign.delete({
      where: { id },
    });
  });
  revalidatePath("/admin");
  return deletedCampaign;
}
