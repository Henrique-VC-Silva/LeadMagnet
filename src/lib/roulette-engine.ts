import { Lead, Prize } from "./mongoose";
import { sendPrizeEmail } from "./email";

export type SpinResult = {
  prize: any;
  success: boolean;
};

export class RouletteEngine {
  /**
   * Performs a weighted selection of a prize for a lead.
   * This is done server-side to prevent manipulation.
   */
  static async spin(leadId: string): Promise<SpinResult> {
    // 1. Verify lead exists
    const lead = await Lead.findById(leadId).lean();

    if (!lead) {
      throw new Error("Lead not found");
    }

    const campaignId = lead.campaignId;

    // 2. Fetch eligible prizes (in stock or No Prize) for this campaign
    const eligiblePrizes = await Prize.find({
      campaignId,
      $or: [
        { stock: { $gt: 0 } },
        { isNoPrize: true }
      ]
    }).lean();

    if (eligiblePrizes.length === 0) {
      throw new Error("No prizes available");
    }

    // 3. Calculate total weight
    const totalWeight = eligiblePrizes.reduce((sum, p) => sum + p.weight, 0);
    let random = Math.floor(Math.random() * totalWeight);

    // 4. Select prize based on weight
    let selectedPrize: any = null;
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

    const prizeId = selectedPrize._id.toString();

    // 5. Update stock if it's not a "No Prize" segment
    if (!selectedPrize.isNoPrize) {
      await Prize.findByIdAndUpdate(prizeId, {
        $inc: { stock: -1 }
      });
    }

    // 6. Record the win for the lead
    await Lead.findByIdAndUpdate(leadId, {
      wonPrizeId: prizeId
    });

    // 7. Send Prize Email (if not a "No Prize" segment)
    if (!selectedPrize.isNoPrize) {
      try {
        await sendPrizeEmail(lead.email, selectedPrize.name, selectedPrize.code);
      } catch (emailError) {
        console.error("Failed to send prize email, but win recorded:", emailError);
      }
    }

    // Format selectedPrize for compatibility
    const prizeFormatted = {
      ...selectedPrize,
      id: prizeId,
    };

    return {
      prize: prizeFormatted,
      success: true,
    };
  }
}
