import prisma from "@/lib/prisma";
import GameContainer from "@/components/GameContainer";

export default async function Home() {
  // Fetch initial prizes to display on the wheel
  const prizes = await prisma.prize.findMany({
    where: {
      OR: [
        { stock: { gt: 0 } },
        { isNoPrize: true }
      ]
    },
    take: 8 // Keep the wheel visually balanced
  });

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-secondary/20">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          Spin to Win Your <span className="text-primary">Exclusive Prize</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Join our community and try your luck. Everyone wins something!
        </p>
      </div>

      <GameContainer initialPrizes={prizes} />
      
      <footer className="mt-20 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lead Magnet Roulette. All rights reserved.
      </footer>
    </main>
  );
}
