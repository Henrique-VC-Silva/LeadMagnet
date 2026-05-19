"use server";

import prisma from "@/lib/prisma";
import { leadSchema, LeadInput } from "@/lib/validations";

export async function createLead(input: LeadInput) {
  const result = leadSchema.safeParse(input);

  if (!result.success) {
    return { error: result.error.format() };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        email: result.data.email,
        name: result.data.name || null,
        phone: result.data.phone || null,
        campaign: result.data.campaign || null,
        consent: result.data.consent,
        consentAt: new Date(),
      },
    });

    return { success: true, leadId: lead.id };
  } catch (error) {
    console.error("Failed to create lead:", error);
    return { error: "Failed to submit. Please try again." };
  }
}
