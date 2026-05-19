import { getThemeSettings } from "@/app/actions/settings";
import { generateThemeStyles } from "@/lib/theme";

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeSettings();
  const themeStyles = generateThemeStyles(theme);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      {children}
    </>
  );
}
