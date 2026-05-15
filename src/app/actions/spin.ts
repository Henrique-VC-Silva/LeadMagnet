"use server";

import { RouletteEngine } from "@/lib/roulette-engine";

export async function spinAction(leadId: string) {
  try {
    const result = await RouletteEngine.spin(leadId);
    return { success: true, prize: result.prize };
  } catch (error: any) {
    return { error: error.message || "Failed to spin" };
  }
}
