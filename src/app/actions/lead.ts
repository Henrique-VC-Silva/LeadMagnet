"use server";

import { Lead, Campaign } from "@/lib/mongoose";
import { leadSchema, LeadInput } from "@/lib/validations";

export async function createLead(input: LeadInput) {
  const result = leadSchema.safeParse(input);

  if (!result.success) {
    return { error: result.error.format() };
  }

  try {
    let campaignId: string | null = null;
    if (result.data.campaign) {
      const campaign = await Campaign.findOne({ slug: result.data.campaign }).lean();
      if (campaign) {
        campaignId = campaign._id.toString();
      }
    }

    const leadDoc = await Lead.create({
      email: result.data.email,
      name: result.data.name || null,
      phone: result.data.phone || null,
      campaignId,
      consent: !!result.data.consent,
      consentAt: new Date(),
    });

    const lead = {
      id: leadDoc._id.toString(),
      email: leadDoc.email,
    };

    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { error: "Failed to submit. Please try again." };
  }
}
