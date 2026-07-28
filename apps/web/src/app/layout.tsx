import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "LifeKit — AI Execution Marketplace for Human Goals", template: "%s | LifeKit" },
  description: "Turn your goals into executable missions. LifeKit uses AI to create roadmaps, find resources, and track your progress from intention to achievement.",
  keywords: ["AI life planner", "goal execution", "mission planning", "AI marketplace", "productivity"],
  authors: [{ name: "LifeKit" }],
  creator: "LifeKit",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lifekit.ai",
    siteName: "LifeKit",
    title: "LifeKit — AI Execution Marketplace for Human Goals",
    description: "Turn your goals into executable missions with AI-powered planning and a curated marketplace.",
  },
  twitter: { card: "summary_large_image", title: "LifeKit", description: "AI-powered goal execution platform" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0b1a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,        // prevent iOS auto-zoom on input focus
  userScalable: false,
  viewportFit: "cover",   // allow content behind notch
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning data-scroll-behavior="smooth">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
