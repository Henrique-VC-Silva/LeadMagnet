import prisma from "@/lib/prisma";
import GameContainer from "@/components/GameContainer";

export const dynamic = "force-dynamic";

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
        in: ["copy_title", "copy_subtitle", "copy_button", "image_logo", "image_mascot", "copy_success"]
      }
    }
  });

  const settings = settingsRaw.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 bg-secondary/20 relative overflow-hidden">
      {settings["image_logo"] && (
        <div className="md:absolute md:top-6 md:left-6 md:mb-0 mb-6 z-10 flex justify-center w-full md:w-auto">
          <img src={settings["image_logo"]} alt="Logo" className="h-12 w-auto object-contain" />
        </div>
      )}

      {settings["image_mascot"] && (
        <div className="absolute bottom-0 right-20 z-0 hidden md:block transition-opacity pointer-events-none">
          <img src={settings["image_mascot"]} alt="Mascot" className="h-96 w-auto object-contain drop-shadow-2xl" />
        </div>
      )}

      <div className="max-w-4xl w-full text-center mt-4 mb-4 relative z-10 px-2 shrink-0">
        <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold mb-3 tracking-tight leading-tight">
          {settings["copy_title"] || "Spin to Win Your Exclusive Prize"}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {settings["copy_subtitle"] || "Join our community and try your luck. Everyone wins something!"}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-4xl relative z-10 py-4">
        <GameContainer 
          initialPrizes={prizes} 
          buttonText={settings["copy_button"]} 
          copySuccess={settings["copy_success"]} 
        />
      </div>
      
      <footer className="mt-auto py-4 text-sm text-muted-foreground relative z-10 shrink-0">
        © {new Date().getFullYear()} Lead Magnet Roulette. All rights reserved.
      </footer>
    </main>
  );
}
