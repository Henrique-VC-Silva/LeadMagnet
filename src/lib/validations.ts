import { z } from "zod";

export const leadSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  phone: z.string().optional(),
  campaign: z.string().optional(),
  consent: z.literal(true, {
    message: "You must consent to participate",
  }),
});

export type LeadInput = z.infer<typeof leadSchema>;
