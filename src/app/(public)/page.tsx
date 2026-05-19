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

  const settingsRaw = await prisma.setting.findMany({
    where: {
      key: {
        in: ["copy_title", "copy_subtitle", "copy_button", "image_logo", "image_mascot"]
      }
    }
  });

  const settings = settingsRaw.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 bg-secondary/20 relative overflow-hidden">
      {settings["image_logo"] && (
        <div className="absolute top-6 left-6 z-10">
          <img src={settings["image_logo"]} alt="Logo" className="h-12 w-auto object-contain" />
        </div>
      )}

      {settings["image_mascot"] && (
        <div className="absolute bottom-0 right-0 md:right-20 z-0 opacity-20 pointer-events-none md:opacity-100 transition-opacity">
          <img src={settings["image_mascot"]} alt="Mascot" className="h-64 md:h-96 w-auto object-contain drop-shadow-2xl" />
        </div>
      )}

      <div className="max-w-4xl w-full text-center mb-12 relative z-10">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
          {settings["copy_title"] || "Spin to Win Your Exclusive Prize"}
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {settings["copy_subtitle"] || "Join our community and try your luck. Everyone wins something!"}
        </p>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <GameContainer initialPrizes={prizes} buttonText={settings["copy_button"]} />
      </div>
      
      <footer className="mt-20 text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lead Magnet Roulette. All rights reserved.
      </footer>
    </main>
  );
}
