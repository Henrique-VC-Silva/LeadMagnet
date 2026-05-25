"use server";

import { RouletteEngine } from "@/lib/roulette-engine";

export async function spinAction(leadId: string) {
  try {
    const result = await RouletteEngine.spin(leadId);
    const serializedPrize = JSON.parse(JSON.stringify(result.prize));
    if (serializedPrize) {
      serializedPrize.id = serializedPrize._id;
    }
    return { success: true, prize: serializedPrize };
  } catch (error: any) {
    return { error: error.message || "Failed to spin" };
  }
}
