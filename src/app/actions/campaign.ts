"use server";

import { Campaign, Prize, Lead } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

const formatObj = (doc: any) => {
  if (!doc) return doc;
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

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
  const campaignDoc = await Campaign.create({
    name: data.name,
    slug: data.slug,
    primaryColor: data.primaryColor ?? "#c5a059",
    secondaryColor: data.secondaryColor ?? "#f1f1f1",
    backgroundImage: data.backgroundImage || null,
    logo: data.logo || null,
    copyTitle: data.copyTitle || null,
    copySubtitle: data.copySubtitle || null,
    copyButton: data.copyButton || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
  });
  revalidatePath("/admin");
  return formatObj(campaignDoc);
}

export async function getCampaigns() {
  await ensureAdmin();
  const campaigns = await Campaign.find().sort({ createdAt: -1 });
  return campaigns.map(formatObj);
}

export async function getCampaignBySlug(slug: string) {
  const campaign = await Campaign.findOne({ slug }).lean();
  if (!campaign) return null;

  campaign.id = campaign._id.toString();
  const prizes = await Prize.find({ campaignId: campaign.id }).sort({ createdAt: 1 }).lean();
  campaign.prizes = prizes.map((p: any) => ({ ...p, id: p._id.toString() }));
  
  return campaign;
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
  const campaignDoc = await Campaign.findByIdAndUpdate(
    id,
    {
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
    { new: true }
  );
  revalidatePath("/admin");
  return formatObj(campaignDoc);
}

export async function deleteCampaign(id: string) {
  await ensureAdmin();
  await Lead.deleteMany({ campaignId: id });
  await Prize.deleteMany({ campaignId: id });
  const deletedCampaign = await Campaign.findByIdAndDelete(id);
  revalidatePath("/admin");
  return formatObj(deletedCampaign);
}
