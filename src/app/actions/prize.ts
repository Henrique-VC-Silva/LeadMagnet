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

export async function getPrizes() {
  await ensureAdmin();
  return await prisma.prize.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createPrize(data: {
  name: string;
  weight: number;
  stock: number;
  code?: string;
  isNoPrize?: boolean;
}) {
  await ensureAdmin();
  const prize = await prisma.prize.create({ data });
  revalidatePath("/admin/prizes");
  return prize;
}

export async function updatePrize(
  id: string,
  data: Partial<{
    name: string;
    weight: number;
    stock: number;
    code: string;
    isNoPrize: boolean;
  }>
) {
  await ensureAdmin();
  const prize = await prisma.prize.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/prizes");
  return prize;
}

export async function deletePrize(id: string) {
  await ensureAdmin();
  await prisma.prize.delete({ where: { id } });
  revalidatePath("/admin/prizes");
}
