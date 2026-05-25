"use server";

import { Setting } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { ThemeConfig, DEFAULT_THEME } from "../../lib/theme";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function getSettings() {
  await ensureAdmin();
  const settings = await Setting.find();
  // Return as a simple object for easier handling
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function saveSettings(data: Record<string, string>) {
  await ensureAdmin();
  
  const operations = Object.entries(data).map(([key, value]) => 
    Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    )
  );

  await Promise.all(operations);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function getThemeSettings(): Promise<ThemeConfig> {
  const settings = await Setting.find({
    key: /^theme_/
  });

  const config = { ...DEFAULT_THEME };
  
  settings.forEach(s => {
    const key = s.key.replace("theme_", "") as keyof ThemeConfig;
    if (key in config) {
      (config as any)[key] = s.value;
    }
  });

  return config;
}
