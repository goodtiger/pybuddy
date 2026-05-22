import type { Metadata, Viewport } from "next";
import { Quicksand, JetBrains_Mono } from "next/font/google";
import { AppPreferencesProvider } from "@/components/AppPreferencesProvider";
import { PwaRegistrar } from "@/components/PwaRegistrar";
import { BottomNav } from "@/components/ui/bottom-nav";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pybuddy.local"),
  title: "PyBuddy - 小海龟教你写Python",
  description: "8岁小朋友的Python学习应用",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PyBuddy",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#4a90e2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${quicksand.variable} ${jetbrains.variable} font-body antialiased`}
      >
        <AppPreferencesProvider>
          {children}
          <BottomNav />
          <PwaRegistrar />
        </AppPreferencesProvider>
      </body>
    </html>
  );
}
