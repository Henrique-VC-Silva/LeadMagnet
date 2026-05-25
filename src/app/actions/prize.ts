"use server";

import { Prize } from "@/lib/mongoose";
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
  const raw = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const obj = JSON.parse(JSON.stringify(raw));
  obj.id = obj._id ? obj._id.toString() : obj.id;
  return obj;
};

export async function getPrizes() {
  await ensureAdmin();
  const prizes = await Prize.find().sort({ createdAt: -1 });
  return prizes.map(formatObj);
}

export async function createPrize(data: {
  name: string;
  weight: number;
  stock: number;
  code?: string;
  isNoPrize?: boolean;
  campaignId?: string;
}) {
  await ensureAdmin();
  const prizeDoc = await Prize.create(data);
  revalidatePath("/admin");
  return formatObj(prizeDoc);
}

export async function updatePrize(
  id: string,
  data: Partial<{
    name: string;
    weight: number;
    stock: number;
    code: string;
    isNoPrize: boolean;
    campaignId: string;
  }>
) {
  await ensureAdmin();
  const prizeDoc = await Prize.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  revalidatePath("/admin");
  return formatObj(prizeDoc);
}

export async function deletePrize(id: string) {
  await ensureAdmin();
  await Prize.findByIdAndDelete(id);
  revalidatePath("/admin");
}
