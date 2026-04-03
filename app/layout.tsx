import "./globals.css";
import type { Metadata, Viewport } from "next";
import PWARegister from "@/components/PWARegister";

export const metadata: Metadata = {
  title: "K-Beauty Routine Planner",
  description: "Luxury K-Beauty Routine Planner mit editierbaren Steps, Empfehlungen, Export/Import und PWA-Support.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KBeauty",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#171717",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>
        <PWARegister />
        {children}
      </body>
    </html>
  );
}
