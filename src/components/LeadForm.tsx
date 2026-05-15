"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, LeadInput } from "@/lib/validations";
import { createLead } from "@/app/actions/lead";
import { Loader2 } from "lucide-react";

interface LeadFormProps {
  onSuccess: (leadId: string) => void;
}

export default function LeadForm({ onSuccess }: LeadFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadInput) => {
    setIsPending(true);
    setServerError(null);

    const result = await createLead(data);

    if (result.error) {
      setServerError(typeof result.error === "string" ? result.error : "Validation failed");
      setIsPending(false);
    } else if (result.leadId) {
      onSuccess(result.leadId);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border border-border shadow-sm rounded-xl">
      <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
        Ready to Spin?
      </h2>
      <p className="text-muted-foreground text-sm mb-6 text-center">
        Enter your details below to unlock your reward.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email *</label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name (Optional)</label>
          <input
            {...register("name")}
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
          <input
            {...register("phone")}
            className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="+1 234 567 890"
          />
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input
            {...register("consent")}
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
            id="consent"
          />
          <label htmlFor="consent" className="text-xs text-muted-foreground leading-tight">
            I agree to receive the prize and marketing materials via email. I can unsubscribe at any time.
          </label>
        </div>
        {errors.consent && (
          <p className="text-red-500 text-xs">{errors.consent.message}</p>
        )}

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Continue to Spin
        </button>
      </form>
    </div>
  );
}
