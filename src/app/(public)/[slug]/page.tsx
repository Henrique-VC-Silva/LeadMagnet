import { Setting } from "@/lib/mongoose";
import GameContainer from "@/components/GameContainer";
import { getCampaignBySlug } from "@/app/actions/campaign";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface CampaignPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const settingsRaw = await Setting.find({
    key: {
      $in: ["copy_title", "copy_subtitle", "copy_button", "image_logo", "image_mascot", "copy_success"]
    }
  });

  const settings = settingsRaw.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  if (campaign.isActive === false) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-secondary/20 relative overflow-hidden">
        {settings["image_logo"] && (
          <div className="md:absolute md:top-6 md:left-6 md:mb-0 mb-6 z-10 flex justify-center w-full md:w-auto">
            <img src={settings["image_logo"]} alt="Logo" className="h-12 w-auto object-contain" />
          </div>
        )}

        <div className="max-w-md w-full relative z-10 px-4 py-8 text-center shrink-0">
          {campaign.logo && (
            <img 
              src={campaign.logo} 
              alt={`${campaign.name} Logo`} 
              className="h-16 md:h-20 w-auto object-contain mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-300"
            />
          )}

          {/* Premium Glassmorphic Card */}
          <div className="backdrop-blur-xl bg-background/40 border border-white/10 dark:border-white/5 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-primary/10">
            {/* Subtle Gradient Glow inside Card */}
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse duration-5000" />
            
            {/* Status Indicator Icon */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-inner border border-destructive/20 relative z-10">
              <svg className="w-8 h-8 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-4 relative z-10 text-foreground">
              Campaign Inactive
            </h2>
            
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 relative z-10">
              This campaign is currently inactive. Please check back later or contact the administrator for access.
            </p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6" />

            <p className="text-xs text-muted-foreground/60 tracking-wider uppercase font-semibold relative z-10">
              {campaign.name}
            </p>
          </div>
        </div>

        <footer className="mt-auto py-4 text-sm text-muted-foreground relative z-10 shrink-0">
          © {new Date().getFullYear()} Lead Magnet Roulette. All rights reserved.
        </footer>
      </main>
    );
  }

  // Filter campaign prizes to only display in-stock items or "no prize" slots
  const prizesRaw = campaign.prizes.filter(
    (prize: any) => prize.stock > 0 || prize.isNoPrize
  );
  const prizes = JSON.parse(JSON.stringify(prizesRaw));

  const copyTitle = campaign.copyTitle || settings["copy_title"] || "Spin to Win Your Exclusive Prize";
  const copySubtitle = campaign.copySubtitle || settings["copy_subtitle"] || "Join our community and try your luck. Everyone wins something!";
  const copyButton = campaign.copyButton || settings["copy_button"] || "Continue to Spin";

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
        {campaign.logo && (
          <img 
            src={campaign.logo} 
            alt={`${campaign.name} Logo`} 
            className="h-16 md:h-20 w-auto object-contain mx-auto mb-6 animate-in fade-in slide-in-from-top-4 duration-300"
          />
        )}
        <h1 className="text-2xl sm:text-3xl md:text-6xl font-extrabold mb-3 tracking-tight leading-tight">
          {copyTitle}
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
          {copySubtitle}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center w-full max-w-4xl relative z-10 py-4">
        <GameContainer 
          campaignSlug={campaign.slug}
          initialPrizes={prizes} 
          buttonText={copyButton} 
          copySuccess={settings["copy_success"]} 
        />
      </div>
      
      <footer className="mt-auto py-4 text-sm text-muted-foreground relative z-10 shrink-0">
        © {new Date().getFullYear()} Lead Magnet Roulette. All rights reserved.
      </footer>
    </main>
  );
}
