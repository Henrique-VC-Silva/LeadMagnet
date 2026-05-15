"use client";

import { useState } from "react";
import LeadForm from "./LeadForm";
import Roulette from "./Roulette";
import { Prize } from "@prisma/client";
import { spinAction } from "@/app/actions/spin";
import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, RefreshCw } from "lucide-react";

export default function GameContainer({ initialPrizes }: { initialPrizes: Prize[] }) {
  const [step, setStep] = useState<"form" | "spin" | "result">("form");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [winningPrize, setWinningPrize] = useState<Prize | null>(null);

  const handleLeadSuccess = async (id: string) => {
    setLeadId(id);
    setStep("spin");
    
    // Trigger the spin on the server
    const result = await spinAction(id);
    if (result.success && result.prize) {
      setWinningPrize(result.prize);
    }
  };

  const handleSpinFinish = () => {
    setStep("result");
  };

  const handleReset = () => {
    setStep("form");
    setWinningPrize(null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AnimatePresence mode="wait">
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <LeadForm onSuccess={handleLeadSuccess} />
          </motion.div>
        )}

        {step === "spin" && (
          <motion.div
            key="spin"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-8"
          >
            <Roulette 
              prizes={initialPrizes} 
              winningPrize={winningPrize} 
              onFinish={handleSpinFinish} 
            />
            <p className="text-xl font-medium animate-pulse">Spinning for your prize...</p>
          </motion.div>
        )}

        {step === "result" && winningPrize && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-8 bg-white border-2 border-primary/20 shadow-xl rounded-2xl text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <PartyPopper className="h-8 w-8 text-primary" />
            </div>
            
            {winningPrize.isNoPrize ? (
              <>
                <h2 className="text-2xl font-bold mb-2">So Close!</h2>
                <p className="text-muted-foreground mb-8">
                  Unfortunately, you didn't win this time. But don't worry, you can try again!
                </p>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90"
                >
                  <RefreshCw className="h-4 w-4" /> Try Again
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">Congratulations!</h2>
                <p className="text-muted-foreground mb-4">You've won:</p>
                <div className="text-3xl font-black text-primary mb-6">
                  {winningPrize.name}
                </div>
                <div className="p-4 bg-secondary rounded-lg mb-8">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your Code</p>
                  <p className="text-xl font-mono font-bold tracking-tighter">{winningPrize.code}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Check your email! We've sent your prize details to you.
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
