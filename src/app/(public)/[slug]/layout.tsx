import { getCampaignBySlug } from "@/app/actions/campaign";
import { notFound } from "next/navigation";

export default async function PublicCampaignLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}>) {
  const { slug } = await params;
  const campaign = await getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const themeStyles = `
    :root {
      --primary: ${campaign.primaryColor};
      --secondary: ${campaign.secondaryColor};
    }
    ${
      campaign.backgroundImage
        ? `
        body {
          background-image: url('${campaign.backgroundImage}') !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
          background-attachment: fixed !important;
        }
        `
        : ""
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      {children}
    </>
  );
}
