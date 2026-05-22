import prisma from "./prisma";
import { Prize } from "@prisma/client";
import { sendPrizeEmail } from "./email";

export type SpinResult = {
  prize: Prize;
  success: boolean;
};

export class RouletteEngine {
  /**
   * Performs a weighted selection of a prize for a lead.
   * This is done server-side to prevent manipulation.
   */
  static async spin(leadId: string): Promise<SpinResult> {
    return await prisma.$transaction(async (tx) => {
      // 1. Verify lead exists
      const lead = await tx.lead.findUnique({
        where: { id: leadId },
      });

      if (!lead) {
        throw new Error("Lead not found");
      }

      // 2. Fetch eligible prizes (in stock or No Prize) for this campaign
      const eligiblePrizes = await tx.prize.findMany({
        where: {
          campaignId: lead.campaignId,
          OR: [
            { stock: { gt: 0 } },
            { isNoPrize: true }
          ]
        }
      });

      if (eligiblePrizes.length === 0) {
        throw new Error("No prizes available");
      }

      // 3. Calculate total weight
      const totalWeight = eligiblePrizes.reduce((sum, p) => sum + p.weight, 0);
      let random = Math.floor(Math.random() * totalWeight);

      // 4. Select prize based on weight
      let selectedPrize: Prize | null = null;
      for (const prize of eligiblePrizes) {
        if (random < prize.weight) {
          selectedPrize = prize;
          break;
        }
        random -= prize.weight;
      }

      if (!selectedPrize) {
        selectedPrize = eligiblePrizes[eligiblePrizes.length - 1];
      }

      // 5. Update stock if it's not a "No Prize" segment
      if (!selectedPrize.isNoPrize) {
        await tx.prize.update({
          where: { id: selectedPrize.id },
          data: { stock: { decrement: 1 } },
        });
      }

      // 6. Record the win for the lead
      await tx.lead.update({
        where: { id: leadId },
        data: { wonPrizeId: selectedPrize.id },
      });

      // 7. Send Prize Email (if not a "No Prize" segment)
      if (!selectedPrize.isNoPrize) {
        try {
          await sendPrizeEmail(lead.email, selectedPrize.name, selectedPrize.code);
        } catch (emailError) {
          console.error("Failed to send prize email, but win recorded:", emailError);
        }
      }

      return {
        prize: selectedPrize,
        success: true,
      };
    });
  }
}
