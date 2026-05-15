"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Prize } from "@prisma/client";
import { MousePointer2 } from "lucide-react";

interface RouletteProps {
  prizes: Prize[];
  winningPrize: Prize | null;
  onFinish: () => void;
}

export default function Roulette({ prizes, winningPrize, onFinish }: RouletteProps) {
  const controls = useAnimation();
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const TOTAL_SEGMENTS = 12;
  
  const segments = useMemo(() => {
    const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);
    let tempSegments: Prize[] = [];

    prizes.forEach((prize) => {
      const segmentCount = Math.max(1, Math.round((prize.weight / totalWeight) * TOTAL_SEGMENTS));
      for (let i = 0; i < segmentCount; i++) {
        tempSegments.push(prize);
      }
    });

    while (tempSegments.length > TOTAL_SEGMENTS) tempSegments.pop();
    while (tempSegments.length < TOTAL_SEGMENTS) tempSegments.push(prizes[0]);

    const shuffled = [...tempSegments].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (shuffled[i].id === shuffled[i + 1].id) {
        for (let j = i + 2; j < shuffled.length; j++) {
          if (shuffled[j].id !== shuffled[i].id) {
            [shuffled[i + 1], shuffled[j]] = [shuffled[j], shuffled[i + 1]];
            break;
          }
        }
      }
    }
    
    return shuffled;
  }, [prizes]);

  const segmentWidth = 360 / TOTAL_SEGMENTS;

  const handleStartSpin = () => {
    if (!winningPrize || isSpinning || hasStarted) return;
    
    setIsSpinning(true);
    setHasStarted(true);

    const winningIndex = segments.findIndex(s => s.id === winningPrize.id);
    const extraSpins = 6 + Math.floor(Math.random() * 4);
    const segmentOffset = (winningIndex * segmentWidth) + (segmentWidth / 2);
    const targetRotation = (extraSpins * 360) - segmentOffset;

    controls.start({
      rotate: targetRotation,
      transition: {
        duration: 8,
        ease: [0.1, 0, 0.1, 1],
      },
    }).then(() => {
      setIsSpinning(false);
      onFinish();
    });
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-[320px] h-[320px] md:w-[450px] md:h-[450px]">
        {/* Outer shadow ring */}
        <div className="absolute inset-[-15px] bg-black/5 rounded-full blur-xl" />
        
        {/* The Wheel */}
        <motion.div
          animate={controls}
          onClick={handleStartSpin}
          className={`w-full h-full rounded-full border-[10px] border-white shadow-2xl overflow-hidden bg-white relative cursor-pointer active:scale-95 transition-transform ${isSpinning ? 'cursor-default active:scale-100' : ''}`}
          style={{ transformOrigin: "center center" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {segments.map((prize, i) => {
              const startAngle = i * segmentWidth;
              const endAngle = (i + 1) * segmentWidth;
              
              const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
              const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
              const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
              const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
              
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
              
              return (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={i % 2 === 0 ? "white" : "#fbfbfb"}
                    stroke="#f0f0f0"
                    strokeWidth="0.2"
                  />
                  
                  {/* Radial Aligned Text */}
                  <g transform={`rotate(${startAngle + segmentWidth / 2} 50 50)`}>
                    <text
                      x="75"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={prize.isNoPrize ? "#94a3b8" : "#1a1a1a"}
                      style={{ 
                        fontSize: "2.8px", 
                        fontWeight: "800",
                        letterSpacing: "0.1px",
                        fontFamily: "var(--font-sans)"
                      }}
                    >
                      {prize.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>

          {/* Prompt Overlay */}
          <AnimatePresence>
            {!hasStarted && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 backdrop-blur-[2px]"
              >
                <div className="bg-white/90 p-4 rounded-full shadow-lg border border-primary/20 animate-bounce">
                  <MousePointer2 className="h-8 w-8 text-primary" />
                </div>
                <p className="mt-4 text-primary font-black tracking-widest text-sm bg-white/80 px-4 py-1 rounded-full border border-primary/10">TAP TO SPIN</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Center Hub */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-[6px] border-secondary shadow-lg z-10 flex items-center justify-center">
             <div className="w-3 h-3 bg-primary rounded-full" />
          </div>
        </motion.div>

        {/* The Ticker / Pointer */}
        <div className="absolute top-[-25px] left-1/2 -translate-x-1/2 z-30">
          <div className="w-8 h-10 bg-primary rounded-b-2xl shadow-xl flex items-center justify-center border-x-4 border-white">
             <div className="w-1.5 h-4 bg-white/20 rounded-full" />
          </div>
          <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[20px] border-t-primary mx-auto" />
        </div>
      </div>
      
      {/* Help message */}
      {!hasStarted && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-muted-foreground font-medium flex items-center gap-2"
        >
          Your prize is ready! Click the wheel to find out what you won.
        </motion.p>
      )}
    </div>
  );
}
