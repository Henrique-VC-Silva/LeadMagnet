"use client";

import { useState, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { Prize } from "@prisma/client";

interface RouletteProps {
  prizes: Prize[];
  onFinish: (prize: Prize) => void;
  winningPrize: Prize | null;
}

export default function Roulette({ prizes, onFinish, winningPrize }: RouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  
  const spin = async () => {
    if (isSpinning || !winningPrize) return;
    setIsSpinning(true);

    const prizeIndex = prizes.findIndex((p) => p.id === winningPrize.id);
    const sliceAngle = 360 / prizes.length;
    // Rotate multiple times + offset to the winning slice
    const rotation = 360 * 5 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));

    await controls.start({
      rotate: rotation,
      transition: { duration: 5, ease: [0.15, 0, 0.15, 1] },
    });

    setIsSpinning(false);
    onFinish(winningPrize);
  };

  // Auto-spin if winningPrize is set
  if (winningPrize && !isSpinning) {
    spin();
  }

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-4 h-8 bg-primary rounded-full shadow-lg" />
      
      {/* The Wheel */}
      <motion.div
        animate={controls}
        className="w-full h-full rounded-full border-8 border-accent shadow-2xl relative overflow-hidden bg-white"
      >
        {prizes.map((prize, i) => {
          const sliceAngle = 360 / prizes.length;
          const rotation = i * sliceAngle;
          return (
            <div
              key={prize.id}
              className="absolute top-0 left-1/2 w-1/2 h-1/2 origin-bottom-left"
              style={{
                transform: `rotate(${rotation}deg)`,
                backgroundColor: i % 2 === 0 ? "#fdfdfd" : "#f1f1f1",
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              <span 
                className="absolute top-8 left-4 block -rotate-45 text-[10px] font-bold text-foreground w-20 text-center"
                style={{ transform: `rotate(${sliceAngle / 2}deg) translateX(-50%)` }}
              >
                {prize.name}
              </span>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
