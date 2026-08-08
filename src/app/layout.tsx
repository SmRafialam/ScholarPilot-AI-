import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Tracker from "./tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://scholar-pilot-ai-flame.vercel.app";
const DESCRIPTION =
  "ScholarPilot AI matches you with the best-fit universities, scholarships and professors, predicts your admission and funding chances, and writes your SOPs, motivation letters and cold emails — all with AI, across 12 study destinations.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ScholarPilot AI — AI Copilot for Studying Abroad",
    template: "%s · ScholarPilot AI",
  },
  description: DESCRIPTION,
  applicationName: "ScholarPilot AI",
  authors: [{ name: "ScholarPilot AI" }],
  creator: "ScholarPilot AI",
  publisher: "ScholarPilot AI",
  category: "education",
  keywords: [
    "study abroad",
    "AI study abroad",
    "university matching",
    "scholarship finder",
    "professor matching",
    "admission chance predictor",
    "funding predictor",
    "SOP generator",
    "statement of purpose AI",
    "motivation letter generator",
    "graduate admissions",
    "masters abroad",
    "PhD abroad",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ScholarPilot AI",
    title: "ScholarPilot AI — AI Copilot for Studying Abroad",
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ScholarPilot AI — AI Copilot for Studying Abroad",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Tracker />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
